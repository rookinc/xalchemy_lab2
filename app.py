from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from server.routes.witness_api import router as witness_api_router
from server.witness.routes import router as witness_router

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI()

app.mount("/assets", StaticFiles(directory=BASE_DIR / "public" / "assets"), name="assets")
app.mount("/public", StaticFiles(directory=BASE_DIR / "public"), name="public")

app.include_router(witness_api_router, prefix="/witness/api")
app.include_router(witness_router, prefix="/witness")


@app.get("/")
def serve_public():
    return FileResponse(BASE_DIR / "public" / "index.html")

@app.get("/favicon.ico", include_in_schema=False)
def serve_favicon():
    return FileResponse(BASE_DIR / "public" / "favicon.ico")

@app.get("/manifest.webmanifest", include_in_schema=False)
def serve_manifest():
    return FileResponse(
        BASE_DIR / "public" / "manifest.webmanifest",
        media_type="application/manifest+json",
    )


@app.get("/witness")
def serve_witness():
    return FileResponse(BASE_DIR / "public" / "witness.html")


@app.get("/hello3d")
def serve_hello3d():
    return FileResponse(BASE_DIR / "public" / "hello3d.html")


@app.get("/spinor-lab")
def serve_spinor_lab():
    return FileResponse(BASE_DIR / "public" / "spinor_lab.html")


@app.get("/spinor-scene-debug")
def serve_spinor_scene_debug():
    return FileResponse(BASE_DIR / "public" / "spinor_scene_debug.html")








@app.get("/field")
def serve_field():
    return FileResponse(BASE_DIR / "public" / "field.html")

@app.get("/tetra-fold")
def serve_tetra_fold():
    return FileResponse(BASE_DIR / "public" / "tetra_fold.html")

@app.get("/tetra-instant")
def serve_tetra_instant():
    return FileResponse(BASE_DIR / "public" / "tetra_instant.html")

@app.get("/spinor-render-debug")
def serve_spinor_render_debug():
    return FileResponse(BASE_DIR / "public" / "spinor_render_debug.html")

@app.get("/cycle/{family}")
def serve_cycle_family(family: str):
    if family not in {"g15", "g30", "g60"}:
        return FileResponse(BASE_DIR / "public" / "index.html")
    return FileResponse(BASE_DIR / "public" / "cycle.html")
