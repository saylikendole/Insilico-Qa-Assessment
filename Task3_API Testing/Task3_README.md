# Task 3 — API Testing: how to run

This folder contains :

- `Task3_API_Testing.docx` — the written test approach, test cases and the issues I found in the API.
- `Insilico_Simulation_API.postman_collection.json` — an importable Postman collection.
- `test_simulation_api.py` — a runnable pytest suite (the same tests, automated).
- `qa_ci_pipeline.yml` — an example GitHub Actions workflow.

## 1. Start the API

The API needs FastAPI, Uvicorn, NumPy and Pydantic. 

```bash
pip install fastapi uvicorn numpy pydantic
uvicorn qa_simulation_api:app --reload
```

The API runs at `http://localhost:8000`. The interactive docs are at `http://localhost:8000/docs`.

## 2. Run the tests in Postman

- Import `Insilico_Simulation_API.postman_collection.json` into Postman.
- The collection variable `baseUrl` defaults to `http://localhost:8000`.
- Run the whole collection (or a folder) with the Postman Collection Runner.

## 3. Run the tests from the command line (Newman)

Newman runs the same Postman collection in CI, with no UI:

```bash
npm install -g newman
newman run Insilico_Simulation_API.postman_collection.json \
  --env-var baseUrl=http://localhost:8000
```

## 4. Run the pytest suite

```bash
pip install pytest requests
pytest test_simulation_api.py -v
```

One test is marked xfail because I expected the API to fail on an extreme input — an input large enough to overflow exp() and return a non-finite value, since the API has no range validation. When I actually ran it, the test passed (it shows as xpass), meaning the API did not leak a non-finite value in this case. I've kept the test in place because the underlying concern — no range validation on inputs — is still real and worth guarding against, even though this specific input didn't trigger it.

## 5. Automate it in CI

`qa_ci_pipeline.yml` starts the API, waits for it, then runs both Newman and pytest on
every push and pull request. Drop it into `.github/workflows/` to run the API tests
automatically in the pipeline.
