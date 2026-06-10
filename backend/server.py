from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

DEFAULT_SETTINGS = {"kdv_rate": 10.0, "invoice_divisor": 2.0}


# ---------- Models ----------
class Settings(BaseModel):
    kdv_rate: float = 10.0
    invoice_divisor: float = 2.0


class CalcInput(BaseModel):
    d17: float = Field(..., gt=0, description="Main voucher amount (USD)")
    i17: float = Field(0, ge=0, description="USD to TRY exchange rate")
    d21: float = Field(0, ge=0, description="Actual invoice amount (TL)")
    kdv_rate: Optional[float] = None
    invoice_divisor: Optional[float] = None


class CalcResult(BaseModel):
    d19: Optional[float] = None  # Required invoice amount (TL)
    i19: Optional[float] = None  # KDV on required invoice (TL)
    i21: float = 0               # KDV on actual invoice (TL)
    i23: Optional[float] = None  # KDV difference (TL)
    i25: float = 0               # KDV difference (USD)
    d23: float = 0               # Cash paid by hand (USD)
    d25: float = 0               # Bank transfer (TL)
    d27: float = 0               # Validation total (USD)
    valid: bool = True


class VoucherCreate(BaseModel):
    company_name: str = ""
    customer_code: str = ""
    invoice_no: str = ""
    voucher_date: str = ""
    d17: float = Field(..., gt=0)
    i17: float = Field(0, ge=0)
    d21: float = Field(0, ge=0)


class Voucher(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str = ""
    customer_code: str = ""
    invoice_no: str = ""
    voucher_date: str = ""
    d17: float
    i17: float = 0
    d21: float = 0
    kdv_rate: float = 10.0
    invoice_divisor: float = 2.0
    results: CalcResult
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ---------- Excel calculation engine ----------
def compute(d17: float, i17: float, d21: float, kdv_rate: float, divisor: float) -> CalcResult:
    """Reproduces MUHASEBE.xlsx formulas exactly:
    D19 = D17/divisor * I17
    I19 = D19 * kdv/100
    I21 = D21 * kdv/100
    I23 = I19 - I21
    I25 = IF(I23/I17 > 0, I23/I17, 0)
    D25 = D21
    D23 = D17 - (D25/I17) - I25
    D27 = D23 + D25/I17 + I25
    """
    if d21 > 0 and i17 <= 0:
        raise HTTPException(status_code=422, detail="Exchange rate (I17) is required when actual invoice amount (D21) > 0")

    if i17 > 0:
        d19 = d17 / divisor * i17
        i19 = d19 * kdv_rate / 100
        i21 = d21 * kdv_rate / 100
        i23 = i19 - i21
        i25 = i23 / i17 if (i23 / i17) > 0 else 0
        d25 = d21
        d23 = d17 - (d25 / i17) - i25
        d27 = d23 + d25 / i17 + i25
        return CalcResult(d19=d19, i19=i19, i21=i21, i23=i23, i25=i25,
                          d23=d23, d25=d25, d27=d27, valid=abs(d27 - d17) < 1e-6)

    # No rate and D21 = 0: TL fields unavailable, USD results derived algebraically
    # I25 = I23/I17 = I19/I17 = (D17/divisor*I17*kdv/100)/I17 = D17/divisor*kdv/100
    i25 = d17 / divisor * kdv_rate / 100
    d23 = d17 - i25
    return CalcResult(d19=None, i19=None, i21=0, i23=None, i25=i25,
                      d23=d23, d25=0, d27=d17, valid=True)


async def get_settings_doc() -> dict:
    doc = await db.settings.find_one({"key": "global"}, {"_id": 0})
    if not doc:
        return dict(DEFAULT_SETTINGS)
    return {"kdv_rate": doc.get("kdv_rate", 10.0), "invoice_divisor": doc.get("invoice_divisor", 2.0)}


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Tahsilat Makbuzu API / Payment Voucher API"}


@api_router.get("/settings", response_model=Settings)
async def get_settings():
    return Settings(**(await get_settings_doc()))


@api_router.put("/settings", response_model=Settings)
async def update_settings(s: Settings):
    if s.kdv_rate < 0 or s.invoice_divisor <= 0:
        raise HTTPException(status_code=422, detail="Invalid settings values")
    await db.settings.update_one(
        {"key": "global"},
        {"$set": {"kdv_rate": s.kdv_rate, "invoice_divisor": s.invoice_divisor}},
        upsert=True,
    )
    return s


@api_router.post("/calculate", response_model=CalcResult)
async def calculate(inp: CalcInput):
    settings = await get_settings_doc()
    kdv = inp.kdv_rate if inp.kdv_rate is not None else settings["kdv_rate"]
    div = inp.invoice_divisor if inp.invoice_divisor is not None else settings["invoice_divisor"]
    return compute(inp.d17, inp.i17, inp.d21, kdv, div)


@api_router.post("/vouchers", response_model=Voucher)
async def create_voucher(inp: VoucherCreate):
    settings = await get_settings_doc()
    results = compute(inp.d17, inp.i17, inp.d21, settings["kdv_rate"], settings["invoice_divisor"])
    voucher = Voucher(
        company_name=inp.company_name,
        customer_code=inp.customer_code,
        invoice_no=inp.invoice_no,
        voucher_date=inp.voucher_date or datetime.now(timezone.utc).date().isoformat(),
        d17=inp.d17, i17=inp.i17, d21=inp.d21,
        kdv_rate=settings["kdv_rate"], invoice_divisor=settings["invoice_divisor"],
        results=results,
    )
    await db.vouchers.insert_one(voucher.model_dump())
    return voucher


@api_router.get("/vouchers", response_model=List[Voucher])
async def list_vouchers():
    docs = await db.vouchers.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Voucher(**d) for d in docs]


@api_router.get("/vouchers/{voucher_id}", response_model=Voucher)
async def get_voucher(voucher_id: str):
    doc = await db.vouchers.find_one({"id": voucher_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Voucher not found")
    return Voucher(**doc)


@api_router.delete("/vouchers/{voucher_id}")
async def delete_voucher(voucher_id: str):
    res = await db.vouchers.delete_one({"id": voucher_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Voucher not found")
    return {"deleted": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
