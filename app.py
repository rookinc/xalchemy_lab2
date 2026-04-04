from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from server.routes.witness_api import router as witness_api_router
from server.witness.routes import router as witness_router
from witness_machine.frontier_bridge import frontier_tick_to_g60_focus
from witness_machine.g60_occupancy import accumulate_g60_occupancy
from witness_machine.g60_chronology import g60_birth_chronology
from witness_machine.g15_sector_registry import g15_sector_registry
from witness_machine.g15_transport_sectors import transport_sector_validation_report
from witness_machine.g15_transport_solver import solver_scaffold_report

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI()

app.mount("/assets", StaticFiles(directory=BASE_DIR / "public" / "assets"), name="assets")
app.mount("/public", StaticFiles(directory=BASE_DIR / "public"), name="public")
app.mount("/specs", StaticFiles(directory=BASE_DIR / "specs"), name="specs")

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












@app.get("/g60-vessel")
def serve_g60_vessel():
    return FileResponse(BASE_DIR / "public" / "g60_vessel.html")

@app.get("/prime-chain")
def serve_prime_chain():
    return FileResponse(BASE_DIR / "public" / "prime_chain.html")

@app.get("/spiral-witness")
def serve_spiral_witness():
    return FileResponse(BASE_DIR / "public" / "spiral_witness.html")

@app.get("/chandelier-witness")
def serve_chandelier_witness():
    return FileResponse(BASE_DIR / "public" / "chandelier_witness.html")

@app.get("/spring-witness")
def serve_spring_witness():
    return FileResponse(BASE_DIR / "public" / "spring_witness.html")


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

@app.get("/g15-transport-shell")
def serve_g15_transport_shell():
    return FileResponse(BASE_DIR / "public" / "g15_transport_shell.html")

@app.get("/g15_transport_shell.html")
def serve_g15_transport_shell_html():
    return FileResponse(BASE_DIR / "public" / "g15_transport_shell.html")

@app.get("/cycle/{family}")
def serve_cycle_family(family: str):
    if family not in {"g15", "g30", "g60"}:
        return FileResponse(BASE_DIR / "public" / "index.html")
    return FileResponse(BASE_DIR / "public" / "cycle.html")


@app.get("/frontier/api/g60-focus/{tick}")
def serve_frontier_g60_focus(tick: int):
    return JSONResponse(frontier_tick_to_g60_focus(tick))


@app.get("/frontier/api/g60-occupancy/{tick}")
def serve_frontier_g60_occupancy(tick: int):
    return JSONResponse(accumulate_g60_occupancy(tick))


@app.get("/frontier/api/g60-chronology/{tick}")
def serve_frontier_g60_chronology(tick: int):
    return JSONResponse(g60_birth_chronology(tick))


@app.get("/frontier/api/g15-sector-registry")
def serve_g15_sector_registry():
    return JSONResponse(g15_sector_registry())


@app.get("/frontier/api/g15-transport-sectors")
def serve_g15_transport_sectors():
    return JSONResponse(transport_sector_validation_report())


@app.get("/frontier/api/g15-transport-solver")
def serve_g15_transport_solver():
    return JSONResponse(solver_scaffold_report())

