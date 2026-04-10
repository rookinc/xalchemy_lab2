#!/usr/bin/env python3
import json
import subprocess
import sys
from pathlib import Path
from datetime import datetime, timezone

CHECKERS = [
    "check_shape.py",
    "check_binary.py",
    "check_row_col_sums.py",
    "check_gram.py",
    "check_overlap_profile.py",
    "check_graph.py",
    "check_distance_profile.py",
    "check_polynomial_identity.py",
    "check_three_angle_geometry.py",
]

EXPORT_CHECKERS = [
    ("check_overlap9_matrices.py", "reports/overlap9_matrices.json"),
]

def run_checker(checker_path, theorem_path):
    proc = subprocess.run(
        [sys.executable, str(checker_path), theorem_path],
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

def run_export_checker(checker_path, theorem_path, output_path):
    proc = subprocess.run(
        [sys.executable, str(checker_path), theorem_path, str(output_path)],
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
    theorem_path = sys.argv[1]
    base = Path(__file__).resolve().parent
    repo = base.parent
    reports = repo / "reports"
    reports.mkdir(exist_ok=True)

    results = []

    for name in CHECKERS:
        results.append(run_checker(base / name, theorem_path))

    for name, rel_out in EXPORT_CHECKERS:
        results.append(
            run_export_checker(
                base / name,
                theorem_path,
                repo / rel_out
            )
        )

    flat = flatten_statuses(results)
    overall = "pass" if all(
        x["status"] == "pass" for x in flat if x["claim_id"]
    ) and all(
        x["status"] != "error" for x in flat
    ) else "fail"

    report = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "theorem_object": theorem_path,
        "overall_status": overall,
        "results": results,
        "summary": flat
    }

    json_path = reports / "verification_report.json"
    md_path = reports / "verification_report.md"

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    lines = []
    lines.append("# Verification Report")
    lines.append("")
    lines.append(f"- theorem object: `{theorem_path}`")
    lines.append(f"- overall status: **{overall.upper()}**")
    lines.append("")
    lines.append("## Claim Summary")
    lines.append("")
    for item in flat:
        cid = item["claim_id"] or "(checker error)"
        lines.append(f"- `{cid}` via `{item['checker']}` -> **{item['status']}**")
    lines.append("")

    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
