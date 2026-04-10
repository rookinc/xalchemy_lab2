#!/usr/bin/env python3
import subprocess
import sys
from pathlib import Path

def main():
    repo = Path(__file__).resolve().parent.parent
    theorem_path = repo / "theorem" / "theorem_object.json"
    runner = repo / "checkers" / "run_all.py"
    out = repo / "reports" / "verification_report.stdout.json"

    proc = subprocess.run(
        [sys.executable, str(runner), str(theorem_path)],
        capture_output=True,
        text=True
    )

    out.parent.mkdir(exist_ok=True)
    out.write_text(proc.stdout, encoding="utf-8")

    if proc.stderr:
        sys.stderr.write(proc.stderr)

    print(proc.stdout)

    raise SystemExit(proc.returncode)

if __name__ == "__main__":
    main()
