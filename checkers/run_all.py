#!/usr/bin/env python3
import json
import subprocess
import sys
from pathlib import Path
from datetime import datetime, timezone

CHECKERS = [
    ("check_shape.py", ["theorem_object"]),
    ("check_binary.py", ["theorem_object"]),
    ("check_row_col_sums.py", ["theorem_object"]),
    ("check_gram.py", ["theorem_object"]),
    ("check_overlap_profile.py", ["theorem_object"]),
    ("check_graph.py", ["theorem_object"]),
    ("check_distance_profile.py", ["theorem_object"]),
    ("check_polynomial_identity.py", ["theorem_object"]),
    ("check_three_angle_geometry.py", ["theorem_object"]),
    ("check_cocycle_data.py", ["theorem_object", "cocycle_data"]),
    ("check_cocycle_min_support.py", ["cocycle_data"]),
    ("check_cocycle_holonomy.py", ["cocycle_data"]),
]

EXPORT_CHECKERS = [
    ("check_overlap9_matrices.py", "reports/overlap9_matrices.json", ["theorem_object"]),
]

def resolve_arg(name, repo):
    if name == "theorem_object":
        return str(repo / "theorem" / "theorem_object.json")
    if name == "cocycle_data":
        return str(repo / "theorem" / "cocycle_data.json")
    return name

def run_checker(checker_path, args):
    proc = subprocess.run(
        [sys.executable, str(checker_path), *args],
        capture_output=True,
        text=True
    )
    if proc.returncode != 0:
        return {
            "checker": checker_path.name,
            "status": "error",
            "stderr": proc.stderr.strip(),
            "stdout": proc.stdout.strip()
        }

    try:
        payload = json.loads(proc.stdout)
    except json.JSONDecodeError as e:
        return {
            "checker": checker_path.name,
            "status": "error",
            "stderr": f"JSON decode error: {e}",
            "stdout": proc.stdout.strip()
        }

    return {
        "checker": checker_path.name,
        "status": "ok",
        "result": payload
    }

def flatten_statuses(results):
    flat = []
    for item in results:
        if item["status"] != "ok":
            flat.append({
                "checker": item["checker"],
                "claim_id": None,
                "status": "error"
            })
            continue

        payload = item["result"]
        if "claims" in payload:
            for c in payload["claims"]:
                flat.append({
                    "checker": item["checker"],
                    "claim_id": c["claim_id"],
                    "status": c["status"]
                })
        else:
            flat.append({
                "checker": item["checker"],
                "claim_id": payload.get("claim_id"),
                "status": payload.get("status")
            })
    return flat

def main():
    repo = Path(__file__).resolve().parent.parent
    reports = repo / "reports"
    reports.mkdir(exist_ok=True)

    results = []

    for name, arg_names in CHECKERS:
        checker_path = repo / "checkers" / name
        args = [resolve_arg(x, repo) for x in arg_names]
        results.append(run_checker(checker_path, args))

    for name, rel_out, arg_names in EXPORT_CHECKERS:
        checker_path = repo / "checkers" / name
        args = [resolve_arg(x, repo) for x in arg_names]
        args.append(str(repo / rel_out))
        results.append(run_checker(checker_path, args))

    flat = flatten_statuses(results)
    overall = "pass" if all(
        x["status"] == "pass" for x in flat if x["claim_id"]
    ) and all(
        x["status"] != "error" for x in flat
    ) else "fail"

    report = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "overall_status": overall,
        "results": results,
        "summary": flat
    }

    with open(reports / "verification_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    with open(reports / "verification_report.md", "w", encoding="utf-8") as f:
        f.write("# Verification Report\n\n")
        f.write(f"- overall status: **{overall.upper()}**\n\n")
        f.write("## Claim Summary\n\n")
        for item in flat:
            cid = item["claim_id"] or "(checker error)"
            f.write(f"- `{cid}` via `{item['checker']}` -> **{item['status']}**\n")

    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
