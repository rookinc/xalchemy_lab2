from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from server.routes.witness_api import router as witness_router

BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"

app = FastAPI(title="Aletheos")

# API
app.include_router(witness_router, prefix="/witness/api")

# Static assets
app.mount("/assets", StaticFiles(directory=PUBLIC_DIR), name="assets")

# Public pages
@app.get("/")
def serve_root():
    return FileResponse(PUBLIC_DIR / "index.html")

@app.get("/witness")
def serve_witness():
    return FileResponse(PUBLIC_DIR / "witness.html")

@app.get("/witness/")
def serve_witness_slash():
    return FileResponse(PUBLIC_DIR / "witness.html")

@app.get("/cycle/g15")
def serve_cycle_g15():
    return FileResponse(PUBLIC_DIR / "cycle.html")

@app.get("/cycle/g30")
def serve_cycle_g30():
    return FileResponse(PUBLIC_DIR / "cycle.html")

@app.get("/cycle/g60")
def serve_cycle_g60():
    return FileResponse(PUBLIC_DIR / "cycle.html")

# Common top-level assets
@app.get("/favicon.ico")
def serve_favicon():
    return FileResponse(PUBLIC_DIR / "favicon.ico")

@app.get("/manifest.webmanifest")
def serve_manifest():
    return FileResponse(PUBLIC_DIR / "manifest.webmanifest")

@app.get("/sw.js")
def serve_sw():
    return FileResponse(PUBLIC_DIR / "sw.js")
