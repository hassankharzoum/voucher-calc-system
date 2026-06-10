"""Backend API tests for TAHSILAT MAKBUZU (Payment Voucher) system."""
import os
import math
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or "https://voucher-calc-system.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module", autouse=True)
def reset_settings(session):
    """Ensure defaults at start and end of run."""
    session.put(f"{API}/settings", json={"kdv_rate": 10, "invoice_divisor": 2})
    yield
    session.put(f"{API}/settings", json={"kdv_rate": 10, "invoice_divisor": 2})


# ---------- Health ----------
class TestHealth:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        assert "message" in r.json()


# ---------- Settings ----------
class TestSettings:
    def test_get_defaults(self, session):
        session.put(f"{API}/settings", json={"kdv_rate": 10, "invoice_divisor": 2})
        r = session.get(f"{API}/settings")
        assert r.status_code == 200
        body = r.json()
        assert body["kdv_rate"] == 10.0
        assert body["invoice_divisor"] == 2.0

    def test_update_and_persist(self, session):
        r = session.put(f"{API}/settings", json={"kdv_rate": 20, "invoice_divisor": 4})
        assert r.status_code == 200
        assert r.json() == {"kdv_rate": 20.0, "invoice_divisor": 4.0}

        # verify via GET
        r2 = session.get(f"{API}/settings")
        assert r2.json() == {"kdv_rate": 20.0, "invoice_divisor": 4.0}

        # affects subsequent calculation (override) - reset to defaults afterwards
        r3 = session.post(f"{API}/calculate", json={"d17": 2000, "i17": 46, "d21": 32000})
        d = r3.json()
        # with kdv=20, divisor=4: d19 = 2000/4 * 46 = 23000
        assert math.isclose(d["d19"], 23000.0, rel_tol=1e-9)
        # restore
        session.put(f"{API}/settings", json={"kdv_rate": 10, "invoice_divisor": 2})

    def test_invalid_divisor(self, session):
        r = session.put(f"{API}/settings", json={"kdv_rate": 10, "invoice_divisor": 0})
        assert r.status_code == 422


# ---------- Calculate ----------
class TestCalculate:
    def test_excel_sample(self, session):
        """Matches MUHASEBE.xlsx sample: d17=2000, i17=46, d21=32000."""
        r = session.post(f"{API}/calculate", json={"d17": 2000, "i17": 46, "d21": 32000})
        assert r.status_code == 200
        d = r.json()
        assert math.isclose(d["d19"], 46000.0, rel_tol=1e-9)
        assert math.isclose(d["i19"], 4600.0, rel_tol=1e-9)
        assert math.isclose(d["i21"], 3200.0, rel_tol=1e-9)
        assert math.isclose(d["i23"], 1400.0, rel_tol=1e-9)
        assert math.isclose(d["i25"], 30.434782608695652, rel_tol=1e-12)
        assert math.isclose(d["d23"], 1273.9130434782608, rel_tol=1e-12)
        assert math.isclose(d["d25"], 32000.0, rel_tol=1e-9)
        assert math.isclose(d["d27"], 2000.0, rel_tol=1e-9)
        assert d["valid"] is True

    def test_no_invoice_no_rate(self, session):
        """d17=2000, d21=0, no i17 → rate not required."""
        r = session.post(f"{API}/calculate", json={"d17": 2000, "d21": 0})
        assert r.status_code == 200
        d = r.json()
        assert d["d19"] is None
        assert d["i19"] is None
        assert d["i23"] is None
        assert math.isclose(d["i25"], 100.0, rel_tol=1e-9)
        assert math.isclose(d["d23"], 1900.0, rel_tol=1e-9)
        assert math.isclose(d["d27"], 2000.0, rel_tol=1e-9)
        assert d["valid"] is True

    def test_invoice_without_rate(self, session):
        r = session.post(f"{API}/calculate", json={"d17": 2000, "i17": 0, "d21": 32000})
        assert r.status_code == 422

    def test_negative_d17(self, session):
        r = session.post(f"{API}/calculate", json={"d17": -1, "i17": 46, "d21": 0})
        assert r.status_code == 422

    def test_override_settings_in_payload(self, session):
        r = session.post(f"{API}/calculate", json={
            "d17": 2000, "i17": 46, "d21": 32000,
            "kdv_rate": 20, "invoice_divisor": 4
        })
        assert r.status_code == 200
        d = r.json()
        assert math.isclose(d["d19"], 23000.0, rel_tol=1e-9)
        assert math.isclose(d["i19"], 4600.0, rel_tol=1e-9)
        assert math.isclose(d["i21"], 6400.0, rel_tol=1e-9)


# ---------- Vouchers CRUD ----------
class TestVouchers:
    def test_full_voucher_lifecycle(self, session):
        # CREATE
        payload = {
            "company_name": "TEST_Acme Ltd",
            "customer_code": "TEST_C001",
            "invoice_no": "TEST_INV001",
            "voucher_date": "2026-01-15",
            "d17": 2000, "i17": 46, "d21": 32000,
        }
        r = session.post(f"{API}/vouchers", json=payload)
        assert r.status_code == 200, r.text
        v = r.json()
        assert "id" in v and len(v["id"]) > 0
        assert v["company_name"] == "TEST_Acme Ltd"
        assert math.isclose(v["results"]["d19"], 46000.0, rel_tol=1e-9)
        assert math.isclose(v["results"]["d27"], 2000.0, rel_tol=1e-9)
        assert v["results"]["valid"] is True
        vid = v["id"]

        # GET single
        r2 = session.get(f"{API}/vouchers/{vid}")
        assert r2.status_code == 200
        v2 = r2.json()
        assert v2["id"] == vid
        assert v2["invoice_no"] == "TEST_INV001"

        # LIST and ensure present
        r3 = session.get(f"{API}/vouchers")
        assert r3.status_code == 200
        ids = [x["id"] for x in r3.json()]
        assert vid in ids
        # confirm _id is not leaking
        assert "_id" not in r3.json()[0]

        # DELETE
        r4 = session.delete(f"{API}/vouchers/{vid}")
        assert r4.status_code == 200
        assert r4.json() == {"deleted": True}

        # GET 404
        r5 = session.get(f"{API}/vouchers/{vid}")
        assert r5.status_code == 404

    def test_delete_nonexistent(self, session):
        r = session.delete(f"{API}/vouchers/nonexistent-uuid-1234")
        assert r.status_code == 404

    def test_voucher_d21_zero(self, session):
        r = session.post(f"{API}/vouchers", json={
            "company_name": "TEST_NoInvoice", "d17": 500, "i17": 0, "d21": 0,
            "voucher_date": "2026-01-15",
        })
        assert r.status_code == 200
        v = r.json()
        assert v["results"]["d19"] is None
        # cleanup
        session.delete(f"{API}/vouchers/{v['id']}")
