#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from witness_machine.g15_transport_witness import load_g15_transport_witness
sys.path.insert(0, str((ROOT / "scripts").resolve()))
import g15_transport_search as base

def main():
    data = load_g15_transport_witness()
    columns = data["columns"]
    report = base.validate_columns(columns)
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
