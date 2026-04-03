from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI()

app.mount("/assets", StaticFiles(directory=BASE_DIR / "public" / "assets"), name="assets")


@app.get("/")
def serve_public():
    return FileResponse(BASE_DIR / "public" / "index.html")


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


@app.get("/spinor-render-debug")
def serve_spinor_render_debug():
    return FileResponse(BASE_DIR / "public" / "spinor_render_debug.html")
