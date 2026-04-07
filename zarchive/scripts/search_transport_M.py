from __future__ import annotations

import json
import random
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from witness_machine.g15_transport_solver import (
    TARGET_COLUMN_WEIGHT,
    TARGET_OVERLAP_BY_DISTANCE,
    TARGET_ROW_WEIGHT,
    theorem_shape_report,
)

ARTIFACT_DIR = Path("artifacts")
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)


def random_row(rng: random.Random, n_cols: int = 30, weight: int = TARGET_ROW_WEIGHT) -> list[int]:
    idx = sorted(rng.sample(range(n_cols), weight))
    return [1 if j in idx else 0 for j in range(n_cols)]


def random_matrix(rng: random.Random, n_rows: int = 15, n_cols: int = 30) -> list[list[int]]:
    return [random_row(rng, n_cols=n_cols, weight=TARGET_ROW_WEIGHT) for _ in range(n_rows)]


def score_report(rep: dict[str, Any]) -> int:
    score = 0

    for w in rep["row_weights"]:
        score += abs(w - TARGET_ROW_WEIGHT) * 10000

    for w in rep["column_weights"]:
        score += abs(w - TARGET_COLUMN_WEIGHT) * 1000

    expected = {"0": [14], "1": [9], "2": [5], "3": [4]}
    got = rep["distance_overlap_values"]

    for k, expected_vals in expected.items():
        vals = got.get(k, [])
        if vals != expected_vals:
            if not vals:
                score += 50000
            else:
                target = expected_vals[0]
                score += sum(abs(v - target) for v in vals) * 200
                score += (len(vals) - 1) * 500

    return score


def mutate_matrix(rng: random.Random, M: list[list[int]]) -> list[list[int]]:
    out = [row[:] for row in M]
    i = rng.randrange(len(out))
    ones = [j for j, x in enumerate(out[i]) if x == 1]
    zeros = [j for j, x in enumerate(out[i]) if x == 0]
    if not ones or not zeros:
        return out
    a = rng.choice(ones)
    b = rng.choice(zeros)
    out[i][a] = 0
    out[i][b] = 1
    return out


def save_candidate(path: Path, M: list[list[int]], rep: dict[str, Any], score: int, meta: dict[str, Any]) -> None:
    payload = {
        "score": score,
        "meta": meta,
        "report": rep,
        "M": M,
    }
    path.write_text(json.dumps(payload, indent=2))


def main() -> None:
    rng = random.Random(1729)

    best_M = random_matrix(rng)
    best_rep = theorem_shape_report(best_M)
    best_score = score_report(best_rep)

    save_candidate(
        ARTIFACT_DIR / "transport_solver_best.json",
        best_M,
        best_rep,
        best_score,
        {"phase": "init"},
    )

    print("initial score:", best_score)

    total_steps = 20000
    report_every = 250

    for step in range(1, total_steps + 1):
        cand = mutate_matrix(rng, best_M)
        rep = theorem_shape_report(cand)
        sc = score_report(rep)

        if sc <= best_score:
            best_M = cand
            best_rep = rep
            best_score = sc

            save_candidate(
                ARTIFACT_DIR / "transport_solver_best.json",
                best_M,
                best_rep,
                best_score,
                {"phase": "search", "step": step},
            )

        if step % report_every == 0:
            print(
                f"step={step} score={best_score} "
                f"rows_ok={best_rep['row_weight_ok']} "
                f"cols_ok={best_rep['column_weight_ok']} "
                f"overlap={best_rep['distance_overlap_values']}"
            )

    save_candidate(
        ARTIFACT_DIR / "transport_solver_final.json",
        best_M,
        best_rep,
        best_score,
        {"phase": "final", "steps": total_steps},
    )

    print("\nfinal score:", best_score)
    print("row weights:", best_rep["row_weights"])
    print("column weights:", best_rep["column_weights"])
    print("distance overlaps:", best_rep["distance_overlap_values"])
    print("theorem shape ok:", best_rep["theorem_shape_ok"])


if __name__ == "__main__":
    main()
