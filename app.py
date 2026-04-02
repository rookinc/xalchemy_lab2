from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from server.routes.witness_api import router as witness_router

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="Lab2")

# API
app.include_router(witness_router, prefix="/witness/api")

# Static assets
app.mount("/assets", StaticFiles(directory=BASE_DIR / "public"), name="assets")
app.mount("/witness_assets", StaticFiles(directory=BASE_DIR / "witness_lab"), name="witness_assets")

# Public root
@app.get("/")
def serve_public():
    return FileResponse(BASE_DIR / "public" / "index.html")

# Witness harness
@app.get("/witness")
def serve_witness():
    return FileResponse(BASE_DIR / "witness" / "index.html")

@app.get("/witness/")
def serve_witness_slash():
    return FileResponse(BASE_DIR / "witness" / "index.html")

@app.get("/cycle/g15")
def serve_cycle_g15():
    return FileResponse(BASE_DIR / "public" / "cycle.html")

@app.get("/cycle/g30")
def serve_cycle_g30():
    return FileResponse(BASE_DIR / "public" / "cycle.html")

@app.get("/cycle/g60")
def serve_cycle_g60():
    return FileResponse(BASE_DIR / "public" / "cycle.html")
