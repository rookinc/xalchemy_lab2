from __future__ import annotations

from .core import (
    State,
    action_cell,
    alignment,
    bit_count,
    fiber_size,
    frame_bits,
    frame_count,
    list_actions,
    list_states,
    mu,
    normalize_word,
    output_signature,
    phase_label,
    species_of_action,
    species_of_state,
    spread,
    state_code,
    state_count,
    tau,
    witness_cycle,
)


def cycle_to_str(cycle: list[str]) -> str:
    if not cycle:
        return ""
    return "-".join(cycle + [cycle[0]])


def state_label(state: State) -> str:
    return f"({state[0]},{state[1]})"


def state_summary(state: State, r: int = 1) -> str:
    cyc = witness_cycle(state, r)
    nxt_tau = tau(state, r)
    nxt_mu = mu(state, r)
    action = action_cell(state[0], r)
    lines = [
        f"state: {state_label(state)}",
        f"code: {state_code(state, r)}",
        f"phase: {phase_label(state, r)}",
        f"witness: {cycle_to_str(cyc)}",
        f"species: {species_of_state(state)}",
        f"alignment: {alignment(state, r)}",
        f"spread: {spread(state, r)}",
        f"fiber: {fiber_size(state, r)}",
        f"action_cell: {cycle_to_str(action)}",
        f"action_species: {species_of_action(state[0], r)}",
        f"tau: {state_label(nxt_tau)}",
        f"mu: {state_label(nxt_mu)}",
    ]
    return "\n".join(lines)


def action_summary(frame: int, r: int = 1) -> str:
    cyc = action_cell(frame, r)
    return "\n".join(
        [
            f"frame: {frame}",
            f"action_cell: {cycle_to_str(cyc)}",
            f"species: {species_of_action(frame, r)}",
        ]
    )


def render_states_list(r: int = 1) -> str:
    rows = []
    for st in list_states(r):
        rows.append(
            f"{state_code(st, r):<8} "
            f"{state_label(st):<8} "
            f"{phase_label(st, r):<10} "
            f"{cycle_to_str(witness_cycle(st, r))}"
        )
    return "\n".join(rows)


def render_actions_list(r: int = 1) -> str:
    rows = []
    for item in list_actions(r):
        rows.append(
            f"frame {item['frame']:<3} "
            f"{cycle_to_str(item['action_cycle'])}  "
            f"[{item['species']}]"
        )
    return "\n".join(rows)


def render_table(r: int = 1) -> str:
    rows = []
    header = (
        f"{'code':<8} {'state':<8} {'phase':<10} {'tau':<8} {'mu':<8} "
        f"{'alignment':<10} {'spread':<6} {'fiber':<5}"
    )
    rows.append(header)
    rows.append("-" * len(header))
    for st in list_states(r):
        rows.append(
            f"{state_code(st, r):<8} "
            f"{state_label(st):<8} "
            f"{phase_label(st, r):<10} "
            f"{state_label(tau(st, r)):<8} "
            f"{state_label(mu(st, r)):<8} "
            f"{alignment(st, r):<10} "
            f"{spread(st, r):<6} "
            f"{fiber_size(st, r):<5}"
        )
    return "\n".join(rows)


def render_ascii_graph(r: int = 1) -> str:
    fb = frame_bits(r)
    lines = [
        f"witness machine M_r with r={r}",
        f"frame_count={frame_count(r)}  state_count={state_count(r)}  "
        f"frame_bits={fb}  bit_count={bit_count(r)}",
        "",
        "subjective phase (p=0)                     objective phase (p=1)",
        "",
    ]

    n = frame_count(r)
    for i in range(n):
        left = f"{state_code((i,0), r)} : ({i},0)"
        right = f"{state_code((i,1), r)} : ({i},1)"
        lines.append(f"{left:<34} --μ[δ{i}]--   {right}")
        if i < n - 1:
            lines.append(f"{'|':>3}{'':<30} {'|':>14}")
            lines.append(f"{'τ':>3}{'':<30} {'τ':>14}")
            lines.append(f"{'|':>3}{'':<30} {'|':>14}")
        else:
            lines.append(f"{'|':>3}{'':<30} {'|':>14}")
            lines.append("  └──────────────────────τ wrap──────────────────────┘")
    return "\n".join(lines)


def render_observer_view(state: State, view: str, r: int = 1) -> str:
    if view == "frame":
        return f"frame: {state[0]}"
    if view == "phase":
        return f"phase: {phase_label(state, r)}"
    if view == "output":
        a, s, f = output_signature(state, r)
        return f"output: alignment={a}, spread={s}, fiber={f}"
    raise ValueError("view must be one of: frame, phase, output")


def render_info(r: int = 1) -> str:
    return "\n".join(
        [
            f"scale: {r}",
            f"frame_count: {frame_count(r)}",
            f"state_count: {state_count(r)}",
            f"frame_bits: {frame_bits(r)}",
            f"bit_count: {bit_count(r)}",
            f"state_species: O-O-O-S-T-S",
            f"action_species: O-S-T-S-T-S",
        ]
    )


def render_orbit(trace: list[dict], title: str | None = None) -> str:
    rows = []
    if title:
        rows.append(title)
    header = f"{'#':<4} {'op':<12} {'code':<8} {'state':<8} {'phase':<10}"
    rows.append(header)
    rows.append("-" * len(header))
    for row in trace:
        rows.append(
            f"{row['step']:<4} "
            f"{row['op']:<12} "
            f"{row['code']:<8} "
            f"{row['state']:<8} "
            f"{row['phase']:<10}"
        )
    return "\n".join(rows)


def render_compare(r1: int, r2: int, words: list[list[str]] | None = None) -> str:
    words = words or [["tau"], ["mu"], ["tau", "mu"]]

    left = {
        "scale": r1,
        "frame_count": frame_count(r1),
        "state_count": state_count(r1),
        "frame_bits": frame_bits(r1),
        "bit_count": bit_count(r1),
        "valid_codes": state_count(r1),
    }
    right = {
        "scale": r2,
        "frame_count": frame_count(r2),
        "state_count": state_count(r2),
        "frame_bits": frame_bits(r2),
        "bit_count": bit_count(r2),
        "valid_codes": state_count(r2),
    }

    rows = []
    rows.append(f"{'metric':<18} {'r='+str(r1):<16} {'r='+str(r2):<16}")
    rows.append("-" * 50)
    for key in ["frame_count", "state_count", "frame_bits", "bit_count", "valid_codes"]:
        rows.append(f"{key:<18} {str(left[key]):<16} {str(right[key]):<16}")

    rows.append("")
    rows.append(f"{'word':<18} {'orbit@r='+str(r1):<16} {'orbit@r='+str(r2):<16}")
    rows.append("-" * 50)
    for word in words:
        info1 = normalize_word(word, r1)
        info2 = normalize_word(word, r2)
        label = ",".join(word)
        rows.append(
            f"{label:<18} {str(info1['orbit_length']):<16} {str(info2['orbit_length']):<16}"
        )

    rows.append("")
    rows.append("note: state_count = 10r, bit_count = ceil(log2(10r))")
    return "\n".join(rows)


def render_explain_cycle(
    cycle: list[str],
    classification: dict,
    show_diff_target: dict | None = None,
) -> str:
    lines = []
    lines.append(f"raw_cycle: {cycle_to_str(cycle)}")
    lines.append(f"normalized_cycle: {cycle_to_str(classification['normalized_cycle'])}")
    lines.append(f"classification: {classification['classification']}")
    lines.append(f"confidence: {classification['confidence']}")

    ds = classification["distance_summary"]
    lines.append(
        "distance_summary: "
        f"S={ds.get('best_subjective_distance')} "
        f"O={ds.get('best_objective_distance')} "
        f"A={ds.get('best_action_distance')}"
    )

    action_frames = sorted(
        {rec["frame"] for rec in classification.get("nearest", {}).get("action", [])}
    )
    if action_frames:
        lines.append(f"nearest_action_frames: {action_frames}")

    if classification.get("action_matches"):
        exact_frames = sorted({rec["frame"] for rec in classification["action_matches"]})
        lines.append(f"exact_action_frames: {exact_frames}")

    if show_diff_target is not None:
        lines.append("")
        lines.append(
            "target_normalized_cycle: "
            f"{cycle_to_str(show_diff_target['target_normalized_cycle'])}"
        )
        lines.append(f"target_spec: {show_diff_target['target_spec']}")
        lines.append(f"hamming_to_target: {show_diff_target['hamming']}")
        if show_diff_target["diff"]:
            lines.append("normalized_diff:")
            for row in show_diff_target["diff"]:
                lines.append(
                    f"  pos{row['position']}: {row['from']} -> {row['to']}"
                )
        else:
            lines.append("normalized_diff: exact")

    return "\n".join(lines)


def render_audit_neighborhood(summary: dict) -> str:
    lines = []
    lines.append(f"cycle: {cycle_to_str(summary['cycle'])}")
    lines.append(f"normalized_cycle: {cycle_to_str(summary['normalized_cycle'])}")
    lines.append(f"child_count: {summary['child_count']}")
    lines.append("")

    lines.append("classification_histogram:")
    for k, v in summary["classification_histogram"].items():
        lines.append(f"  {k}: {v}")

    lines.append("")
    lines.append("confidence_histogram:")
    for k, v in summary["confidence_histogram"].items():
        lines.append(f"  {k}: {v}")

    lines.append("")
    lines.append("best_action_distance_histogram:")
    for k, v in summary["best_action_distance_histogram"].items():
        lines.append(f"  {k}: {v}")

    if summary.get("nearest_action_frame_histogram"):
        lines.append("")
        lines.append("nearest_action_frame_histogram:")
        for k, v in summary["nearest_action_frame_histogram"].items():
            lines.append(f"  {k}: {v}")

    if summary.get("slot4_transition_histogram"):
        lines.append("")
        lines.append("slot4_transition_histogram:")
        for row in summary["slot4_transition_histogram"]:
            lines.append(
                f"  {row['from']} -> {row['to']} :: {row['count']}"
            )

    if summary.get("examples"):
        lines.append("")
        lines.append("examples:")
        for label, rows in summary["examples"].items():
            lines.append(f"  {label}:")
            for row in rows:
                lines.append(
                    f"    {row['label']} :: "
                    f"class={row['classification']} "
                    f"conf={row['confidence']} "
                    f"A={row['best_action_distance']} "
                    f"cycle={cycle_to_str(row['normalized_cycle'])}"
                )

    return "\n".join(lines)


def render_verify_report(result: dict) -> str:
    lines = []
    overall = result.get("overall", {})
    lines.append("witness_machine theorem verification")
    lines.append(f"overall: {overall.get('status', 'unknown')}")
    lines.append("")

    for section in result.get("sections", []):
        lines.append(f"[{section['section']}] status={section['status']} passed={section['passed']}")
        for check in section.get("checks", []):
            mark = "PASS" if check["passed"] else "FAIL"
            lines.append(
                f"  - {mark:<4} {check['name']} [{check.get('status', section['status'])}]"
            )
            detail = check.get("detail")
            if detail:
                lines.append(f"      {detail}")
        note = section.get("note")
        if note:
            lines.append(f"      note: {note}")
        lines.append("")

    ledger = result.get("ledger", {})
    if ledger:
        lines.append("ledger:")
        for key in ["verified", "modeled", "assumed", "open"]:
            items = ledger.get(key, [])
            lines.append(f"  {key}:")
            for item in items:
                lines.append(f"    - {item}")
        lines.append("")

    return "\n".join(lines).rstrip()
