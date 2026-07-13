"""
API tests for the simulation service (POST /simulate/).

Run:
    1. Start the API:   uvicorn qa_simulation_api:app --reload
    2. Install deps:    pip install pytest requests
    3. Run tests:       pytest test_simulation_api.py -v

The base URL can be overridden with the BASE_URL environment variable.
"""

import math
import os
import pytest
import requests

BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
URL = f"{BASE_URL}/simulate/"


def body(i1, i2, a, b):
    """Build the request body. Note the two nested objects the API requires."""
    return {"input_data": {"i1": i1, "i2": i2}, "model_params": {"a": a, "b": b}}


def expected(a, b, i1, i2):
    """The model equations, reproduced so I can assert outputs against known values."""
    o1 = a * i1 + b * i2
    o2 = math.sin(a * i1) + math.cos(b * i2)
    o3 = math.exp(-a * i1) + math.log1p(abs(b * i2 - 2))
    return o1, o2, o3


# --------------------------------------------------------------------------
# Positive / happy path
# --------------------------------------------------------------------------
@pytest.mark.parametrize(
    "a,b,i1,i2",
    [(1, 1, 1, 2), (2, 3, 1, 1), (0, 0, 0, 0), (1, 1, -1, -2)],
)
def test_valid_request_returns_correct_outputs(a, b, i1, i2):
    r = requests.post(URL, json=body(i1, i2, a, b))
    assert r.status_code == 200
    out = r.json()["outputs"]
    o1, o2, o3 = expected(a, b, i1, i2)
    assert out["o1"] == pytest.approx(o1, abs=1e-6)
    assert out["o2"] == pytest.approx(o2, abs=1e-6)
    assert out["o3"] == pytest.approx(o3, abs=1e-6)


def test_response_has_expected_structure():
    r = requests.post(URL, json=body(1, 2, 1, 1))
    data = r.json()
    assert set(data.keys()) == {"inputs", "outputs"}
    assert set(data["inputs"].keys()) == {"i1", "i2"}
    assert set(data["outputs"].keys()) == {"o1", "o2", "o3"}


def test_inputs_are_echoed_back():
    r = requests.post(URL, json=body(1.5, 2.5, 1, 1))
    assert r.json()["inputs"] == {"i1": 1.5, "i2": 2.5}


# --------------------------------------------------------------------------
# Negative / validation
# --------------------------------------------------------------------------
def test_missing_input_field_returns_422():
    payload = {"input_data": {"i2": 2}, "model_params": {"a": 1, "b": 1}}  # i1 missing
    assert requests.post(URL, json=payload).status_code == 422


def test_wrong_type_returns_422():
    payload = {"input_data": {"i1": "abc", "i2": 2}, "model_params": {"a": 1, "b": 1}}
    assert requests.post(URL, json=payload).status_code == 422


def test_missing_model_params_returns_422():
    assert requests.post(URL, json={"input_data": {"i1": 1, "i2": 2}}).status_code == 422


def test_flat_body_is_rejected():
    # Documents the non-obvious contract: the API needs the two nested objects,
    # not a flat {i1, i2, a, b}. A consumer sending a flat body gets a 422.
    assert requests.post(URL, json={"i1": 1, "i2": 2, "a": 1, "b": 1}).status_code == 422


def test_empty_body_returns_422():
    assert requests.post(URL, json={}).status_code == 422


def test_get_method_not_allowed():
    assert requests.get(URL).status_code == 405


# --------------------------------------------------------------------------
# Edge / boundary
# --------------------------------------------------------------------------
def test_small_values_are_handled():
    r = requests.post(URL, json=body(i1=1e-9, i2=1e-9, a=1, b=1))
    assert r.status_code == 200
    for v in r.json()["outputs"].values():
        assert math.isfinite(v)


@pytest.mark.xfail(
    reason="Known finding: the API has no range validation, so an extreme input "
    "(a*i1 very negative) overflows exp() and returns a non-finite value.",
    strict=False,
)
def test_extreme_input_should_not_return_non_finite():
    # a*i1 = -1000  ->  exp(1000) overflows to infinity in numpy.
    # A well-guarded API would validate the range or return a clear error
    # instead of leaking a non-finite value into a JSON response.
    r = requests.post(URL, json=body(i1=-1000, i2=1, a=1, b=1))
    if r.status_code == 200:
        o3 = r.json()["outputs"]["o3"]
        assert math.isfinite(o3), "API returned a non-finite o3 for an extreme input"
