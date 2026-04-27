from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from server.dictionary.routes import router as dictionary_router
from server.graph.routes import router as graph_router

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI()

app.include_router(dictionary_router)
app.include_router(graph_router)

app.mount("/shared", StaticFiles(directory=BASE_DIR / "shared"), name="shared")
app.mount("/graph_viewer_assets", StaticFiles(directory=BASE_DIR / "graph_viewer"), name="graph_viewer_assets")


@app.get("/")
def root_index():
    return FileResponse(BASE_DIR / "index.html")


@app.get("/graph_viewer")
def graph_viewer_index():
    return FileResponse(BASE_DIR / "graph_viewer" / "lab.html")


@app.get("/graph_viewer/")
def graph_viewer_index_slash():
    return RedirectResponse(url="/graph_viewer", status_code=307)


@app.get("/graph_viewer/index.html")
def graph_viewer_index_html():
    return RedirectResponse(url="/graph_viewer", status_code=307)
