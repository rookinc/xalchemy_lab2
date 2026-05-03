#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
LENS_PATH = ROOT / "json" / "bubble_witness_lens.json"
PARAMS_PATH = ROOT / "json" / "collapse_params.json"
THEOREM_PATH = ROOT / "json" / "theorem_object.json"

EXPECTED_STATIONS = ["A", "D", "E", "C", "B", "F"]
EXPECTED_PHASES = [
    "latent_round",
    "defect_selection",
    "cup_fold",
    "throat_bridge",
    "rebound_jet",
    "relaxation",
]


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def load_json(path: Path) -> dict:
    if not path.exists():
        fail(f"missing file: {path}")
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as exc:
        fail(f"invalid JSON in {path}: {exc}")


def assert_station_contract(lens: dict) -> None:
    if lens.get("status") != "exploratory_lens":
        fail("lens status must be exploratory_lens")

    if lens.get("not_theorem_object") is not True:
        fail("not_theorem_object must be true")

    stations = lens.get("stations")
    if not isinstance(stations, dict):
        fail("stations must be an object")

    if list(stations.keys()) != EXPECTED_STATIONS:
        fail(f"station order/names must be exactly {EXPECTED_STATIONS}")

    seen: set[int] = set()
    for name in EXPECTED_STATIONS:
        rows = stations[name]
        if not isinstance(rows, list) or not rows:
            fail(f"station {name} must be a non-empty list")

        for row in rows:
            if not isinstance(row, int):
                fail(f"station {name} contains non-integer row: {row!r}")
            if row < 0 or row > 14:
                fail(f"station {name} row out of range 0..14: {row}")
            if row in seen:
                fail(f"row {row} appears in more than one station")
            seen.add(row)

    phases = lens.get("phase_sequence")
    if phases != EXPECTED_PHASES:
        fail(f"phase_sequence must be exactly {EXPECTED_PHASES}")

    anti_drift = lens.get("anti_drift")
    if not isinstance(anti_drift, list) or len(anti_drift) < 3:
        fail("anti_drift must contain at least three rules")

    joined = " ".join(str(x).lower() for x in anti_drift)
    for required in ["does not change", "exploratory", "not a physical derivation"]:
        if required not in joined:
            fail(f"anti_drift must include phrase/concept: {required}")


def assert_params_contract(params: dict) -> None:
    if params.get("status") != "exploratory_parameters":
        fail("collapse_params status must be exploratory_parameters")

    for key in ["time_steps", "dt", "damping", "stiffness", "coupling", "nonlinear", "forcing", "render"]:
        if key not in params:
            fail(f"collapse_params missing key: {key}")

    if params["dt"] <= 0:
        fail("dt must be positive")

    if params["damping"] < 0:
        fail("damping must be non-negative")

    forcing = params["forcing"]
    source = forcing.get("source_vertex")
    if not isinstance(source, int) or source < 0 or source > 14:
        fail("forcing.source_vertex must be an integer in 0..14")

    if forcing.get("amplitude", 0) < 0:
        fail("forcing.amplitude must be non-negative")

    if forcing.get("width", 0) <= 0:
        fail("forcing.width must be positive")


def assert_theorem_available(theorem: dict) -> None:
    if theorem.get("name") != "G15 transport theorem object":
        fail("unexpected theorem object name")

    if theorem.get("shape_M") != [15, 30]:
        fail("shape_M must be [15, 30]")

    if theorem.get("shape_Q") != [15, 15]:
        fail("shape_Q must be [15, 15]")

    if len(theorem.get("petersen_edges_indexing", [])) != 15:
        fail("petersen_edges_indexing must contain 15 edges")

    matrix = theorem.get("matrix_M")
    if not isinstance(matrix, list) or len(matrix) != 15:
        fail("matrix_M must have 15 rows")
    if any(not isinstance(row, list) or len(row) != 30 for row in matrix):
        fail("every matrix_M row must have 30 columns")


def main() -> None:
    lens = load_json(LENS_PATH)
    params = load_json(PARAMS_PATH)
    theorem = load_json(THEOREM_PATH)

    assert_station_contract(lens)
    assert_params_contract(params)
    assert_theorem_available(theorem)

    print("PASS: bubble witness lens contract")


if __name__ == "__main__":
    main()
