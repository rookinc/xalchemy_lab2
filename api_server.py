from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from server.witness.routes import router as witness_router

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="Witness Harness")

app.include_router(witness_router)

app.mount(
    "/witness_assets",
    StaticFiles(directory=BASE_DIR / "witness_lab"),
    name="witness_assets",
)


@app.get("/")
def root_index():
    return RedirectResponse(url="/witness", status_code=307)


@app.get("/witness")
def witness_index():
    return FileResponse(BASE_DIR / "witness_lab" / "index.html")


@app.get("/witness/")
def witness_index_slash():
    return RedirectResponse(url="/witness", status_code=307)
