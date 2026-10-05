import json
import sys
from collections import Counter, defaultdict
from datetime import date, datetime
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from data.Dashboard.schemas import DashboardResponse
from data.ProgressTask.schemas import ProgressTaskResponse
from data.RiskPrediction.schemas import RiskPredictionResponse
from data.common.schemas import PowerAutomateWbsPayload, RiskItemSchema, TaskItemSchema


OUTPUT_PATH = ROOT / "data" / "transformed_powerautomate_schemas.json"
COMPONENT_OUTPUTS = {
    "ProgressTaskResponse": ROOT / "data" / "ProgressTask" / "transformed.json",
    "DashboardResponse": ROOT / "data" / "Dashboard" / "transformed.json",
    "RiskPredictionResponse": ROOT / "data" / "RiskPrediction" / "transformed.json",
}

PROBABILITY_WEIGHTS = {
    "days_gt_14": 0.10,
    "days_8_to_14": 0.30,
    "days_4_to_7": 0.50,
    "days_1_to_3": 0.75,
    "due_today": 0.90,
    "overdue": 1.00,
}

AVATAR_COLORS = [
    "bg-[#1877f2]",
    "bg-[#0284c7]",
    "bg-[#059669]",
    "bg-[#6366f1]",
    "bg-[#0ea5e9]",
    "bg-[#64748b]",
    "bg-[#9333ea]",
    "bg-[#0d9488]",
]


def dump_model(model: Any) -> dict[str, Any]:
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


def fetch_powerautomate_payload() -> PowerAutomateWbsPayload:
    from data.get_data_wbs import get_flow_url

    response = requests.post(get_flow_url(), json={}, timeout=120)
    response.raise_for_status()
    message = response.json()["msg"]
    return PowerAutomateWbsPayload(**message)


def parse_date(value: str) -> date | None:
    if not value:
        return None
    text = value.strip()
    for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y/%m/%d", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def normalize_priority(value: str) -> str:
    cleaned = (value or "").strip().title()
    if cleaned in {"Critical", "High", "Medium", "Low"}:
        return cleaned
    return "Medium"


def normalize_progress(value: str | float | int) -> int:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 0
    if number <= 1:
        number *= 100
    return max(0, min(100, round(number)))


def initials_from_name(name: str) -> str:
    cleaned = name.strip()
    if not cleaned:
        return "NA"
    parts = re.split(r"[\s,._-]+", cleaned)
    if len(parts) >= 2:
        return "".join(part[0] for part in parts[:2]).upper()
    letters = re.findall(r"[A-Za-z]", cleaned)
    return "".join(letters[:2]).upper() or cleaned[:2].upper()


def due_relative(due_date: date | None, today: date) -> str | None:
    if due_date is None:
        return None
    diff = (due_date - today).days
    if diff < 0:
        return f"Overdue {abs(diff)} days"
    if diff == 0:
        return "Due today"
    return f"In {diff} days"


def normalize_status(raw_status: str, progress: int, due_date: date | None, today: date) -> str:
    status = (raw_status or "").strip().lower()
    if status in {"done", "completed", "complete"} or progress >= 100:
        return "Completed"
    if due_date and due_date < today:
        return "Overdue"
    if status in {"in-progress", "in progress", "doing"}:
        return "In Progress"
    if status in {"pending"}:
        return "Pending"
    return "To Do"


def task_sort_key(task: TaskItemSchema) -> tuple[int, int, str]:
    priority_rank = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    status_rank = {"Overdue": 0, "In Progress": 1, "To Do": 2, "Pending": 3, "Completed": 4}
    return (status_rank[task.status], priority_rank[task.priority], task.due_date)


def sprint_number(sprint: str | None) -> int:
    if not sprint:
        return -1
    match = re.search(r"(\d+)", sprint)
    return int(match.group(1)) if match else -1


def is_task_function_id(value: str | int | float) -> bool:
    return bool(re.fullmatch(r"\d+(?:\.\d+)?", str(value).strip()))


def is_cancelled_status(value: str) -> bool:
    return (value or "").strip().lower() in {"cancel", "cancelled", "canceled"}


def transform_tasks(payload: PowerAutomateWbsPayload, today: date) -> list[TaskItemSchema]:
    tasks: list[TaskItemSchema] = []
    task_rows = [
        raw
        for raw in payload.raw_tasks
        if is_task_function_id(raw.function_id) and not is_cancelled_status(raw.status)
    ]
    for index, raw in enumerate(task_rows, start=1):
        progress = normalize_progress(raw.progress)
        end_date = parse_date(raw.plan_end)
        status = normalize_status(raw.status, progress, end_date, today)
        owner_name = raw.pic.strip() or "Unassigned"
        owner = {
            "name": owner_name,
            "initials": initials_from_name(owner_name),
            "avatar_color": AVATAR_COLORS[hash(owner_name) % len(AVATAR_COLORS)],
            "role": None,
        }
        tasks.append(
            TaskItemSchema(
                id=f"TSK-{index:04d}",
                st=index,
                function_id=str(raw.function_id).strip(),
                title=raw.detail.strip() or "Untitled task",
                project=raw.type.strip() or "PMA Agent",
                priority=normalize_priority(raw.priority),
                progress=progress,
                due_date=end_date.isoformat() if end_date else "",
                owner=owner,
                status=status,
                sprint=raw.sprint.strip() or None,
                completed=status == "Completed",
                source_type=raw.type.strip() or None,
            )
        )
    return tasks


def summarize_tasks(tasks: list[TaskItemSchema]) -> dict[str, int | float]:
    total = len(tasks)

    def count(status: str) -> int:
        return sum(1 for task in tasks if task.status == status)

    completed_count = count("Completed")
    in_progress_count = count("In Progress")
    pending_count = count("Pending") + count("To Do")
    overdue_count = count("Overdue")
    rate = lambda value: round((value / total * 100), 2) if total else 0.0
    return {
        "total_tasks": total,
        "completed_count": completed_count,
        "completed_rate_pct": rate(completed_count),
        "in_progress_count": in_progress_count,
        "in_progress_rate_pct": rate(in_progress_count),
        "pending_count": pending_count,
        "pending_rate_pct": rate(pending_count),
        "overdue_count": overdue_count,
        "overdue_rate_pct": rate(overdue_count),
    }


def build_sprint_chart(tasks: list[TaskItemSchema], selected_sprint: str) -> list[dict[str, str | int | bool]]:
    by_sprint: dict[str, list[TaskItemSchema]] = defaultdict(list)
    for task in tasks:
        by_sprint[task.sprint or "No Sprint"].append(task)
    recent_sprints = sorted(by_sprint, key=sprint_number)[-6:]
    chart = []
    for sprint in recent_sprints:
        sprint_tasks = by_sprint[sprint]
        chart.append(
            {
                "sprint": sprint,
                "completed": sum(1 for task in sprint_tasks if task.status == "Completed"),
                "in_progress": sum(1 for task in sprint_tasks if task.status == "In Progress"),
                "to_do": sum(1 for task in sprint_tasks if task.status in {"To Do", "Pending"}),
                "overdue": sum(1 for task in sprint_tasks if task.status == "Overdue"),
                "is_current": sprint == selected_sprint,
            }
        )
    return chart


def deadline_weight(due_date: str, today: date) -> float:
    parsed = parse_date(due_date)
    if parsed is None:
        return PROBABILITY_WEIGHTS["days_gt_14"]
    diff = (parsed - today).days
    if diff < 0:
        return PROBABILITY_WEIGHTS["overdue"]
    if diff == 0:
        return PROBABILITY_WEIGHTS["due_today"]
    if 1 <= diff <= 3:
        return PROBABILITY_WEIGHTS["days_1_to_3"]
    if 4 <= diff <= 7:
        return PROBABILITY_WEIGHTS["days_4_to_7"]
    if 8 <= diff <= 14:
        return PROBABILITY_WEIGHTS["days_8_to_14"]
    return PROBABILITY_WEIGHTS["days_gt_14"]


def probability_label(value: float) -> str:
    if value >= 70:
        return "High"
    if value >= 40:
        return "Medium"
    return "Low"


def impact_label(value: float) -> str:
    if value >= 4:
        return "Critical"
    if value >= 3:
        return "High"
    if value >= 2:
        return "Medium"
    return "Low"


def build_risks(tasks: list[TaskItemSchema], selected_sprint: str, today: date) -> list[RiskItemSchema]:
    sprint_tasks = [task for task in tasks if task.sprint == selected_sprint]
    by_owner: dict[str, list[TaskItemSchema]] = defaultdict(list)
    for task in sprint_tasks:
        by_owner[str(task.owner.get("name") or "Unassigned")].append(task)

    risks: list[RiskItemSchema] = []
    round_loop = 0
    for index, (owner, owner_tasks) in enumerate(sorted(by_owner.items()), start=1):
        affected = [task for task in owner_tasks if not task.completed]
        if not affected:
            continue
        probability_pct = round(sum(deadline_weight(task.due_date, today) for task in affected) / len(affected) * 100, 2)
        impact_score = round(1 + 4 * (len(affected) / len(owner_tasks)), 2)
        score = round((probability_pct / 100) * impact_score * 5, 2)
        representative_due = min((parse_date(task.due_date) for task in affected if task.due_date), default=None)
        has_overdue = any(task.status == "Overdue" for task in affected)
        function_counts = Counter(task.project or task.source_type or "PMA Agent" for task in owner_tasks)
        affected_function = function_counts.most_common(1)[0][0]
        round_loop += 1
        risks.append(
            RiskItemSchema(
                id=f"RSK-{round_loop:03d}",
                risk_name=f"{owner} delivery risk",
                sprint=selected_sprint,
                title=f"{len(affected)} active task(s) may affect {affected_function} delivery in {selected_sprint}.",
                impact=impact_label(impact_score),
                impact_score=impact_score,
                probability=probability_label(probability_pct),
                probability_pct=probability_pct,
                score=score,
                status="Overdue" if has_overdue else "In Progress",
                owner=owner,
                owner_initials=initials_from_name(owner),
                owner_avatar_color=AVATAR_COLORS[hash(owner) % len(AVATAR_COLORS)],
                due_date=representative_due.isoformat() if representative_due else None,
                due_relative=due_relative(representative_due, today),
                mitigation_plan="Review active tasks, confirm blockers, and adjust owner capacity or deadline plan.",
                affected_function=affected_function,
                affected_tasks=len(affected),
                total_tasks=len(owner_tasks),
            )
        )
    return sorted(risks, key=lambda risk: risk.score, reverse=True)


def build_all_risks(tasks: list[TaskItemSchema], today: date) -> list[RiskItemSchema]:
    risks: list[RiskItemSchema] = []
    for sprint in sorted({task.sprint for task in tasks if task.sprint}, key=sprint_number):
        risks.extend(build_risks(tasks, sprint, today))
    return risks


def build_owner_exposures(risks: list[RiskItemSchema]) -> list[dict[str, str | int | float | None]]:
    rows = []
    for rank, risk in enumerate(sorted(risks, key=lambda item: item.score, reverse=True), start=1):
        rows.append(
            {
                "rank": rank,
                "name": risk.owner,
                "role": None,
                "initials": risk.owner_initials,
                "avatar_color": risk.owner_avatar_color,
                "total_risks": 1,
                "critical_count": 1 if risk.impact == "Critical" else 0,
                "high_count": 1 if risk.impact == "High" else 0,
                "medium_count": 1 if risk.impact == "Medium" else 0,
                "risk_score": risk.score,
                "max_score": 25,
                "overdue_count": 1 if risk.status == "Overdue" else 0,
                "top_threat_risk": risk.id,
            }
        )
    return rows


def build_progress_response(tasks: list[TaskItemSchema], selected_sprint: str, today: date) -> ProgressTaskResponse:
    sprint_tasks = [task for task in tasks if task.sprint == selected_sprint]
    today_count = sum(1 for task in sprint_tasks if parse_date(task.due_date) == today)
    return ProgressTaskResponse(
        selected_sprint=selected_sprint,
        summary=summarize_tasks(sprint_tasks),
        tabs={
            "today_count": today_count,
            "overdue_count": sum(1 for task in sprint_tasks if task.status == "Overdue"),
            "completed_count": sum(1 for task in sprint_tasks if task.status == "Completed"),
        },
        sprint_chart=build_sprint_chart(tasks, selected_sprint),
        tasks=tasks,
    )


def build_dashboard_response(
    tasks: list[TaskItemSchema],
    risks: list[RiskItemSchema],
    selected_sprint: str,
) -> DashboardResponse:
    sprint_tasks = [task for task in tasks if task.sprint == selected_sprint]
    summary = summarize_tasks(sprint_tasks)
    delivery_trend = []
    for item in build_sprint_chart(tasks, selected_sprint):
        delivery_trend.append(
            {
                "sprint": str(item["sprint"]),
                "created": int(item["completed"]) + int(item["in_progress"]) + int(item["to_do"]) + int(item["overdue"]),
                "completed": int(item["completed"]),
            }
        )
    risk_counter = Counter((risk.impact, risk.probability) for risk in risks)
    risk_distribution = [
        {"impact": impact, "probability": probability, "count": count}
        for (impact, probability), count in sorted(risk_counter.items())
    ]
    completed_rate = float(summary["completed_rate_pct"])
    critical_count = sum(1 for risk in risks if risk.status not in {"Mitigated", "Completed"})
    return DashboardResponse(
        selected_sprint=selected_sprint,
        sprint_summary=summary,
        sprint_health={
            "label": "Sprint Health",
            "value": completed_rate,
            "status": "On Track" if completed_rate >= 70 else "At Risk",
            "delta_vs_previous_sprint": None,
        },
        critical_risk={
            "label": "Critical Risk",
            "value": critical_count,
            "status": "At Risk" if critical_count else "On Track",
            "delta_vs_previous_sprint": None,
        },
        audit_pending=None,
        delivery_trend=delivery_trend,
        risk_distribution=risk_distribution,
        attention_tasks=sorted(sprint_tasks, key=task_sort_key)[:5],
        total_tasks={"count": len(sprint_tasks), "rate_pct": 100.0 if sprint_tasks else 0.0},
    )


def build_risk_response(risks: list[RiskItemSchema], selected_sprint: str) -> RiskPredictionResponse:
    selected_risks = [risk for risk in risks if risk.sprint == selected_sprint]
    total = len(selected_risks)
    avg_probability = round(sum(risk.probability_pct for risk in selected_risks) / total, 2) if total else 0.0
    avg_impact = round(sum(risk.impact_score for risk in selected_risks) / total, 2) if total else 1.0
    return RiskPredictionResponse(
        selected_sprint=selected_sprint,
        formula={
            "probability_weights": PROBABILITY_WEIGHTS,
            "impact_min": 1.0,
            "impact_max": 5.0,
        },
        summary={
            "total_risks": total,
            "critical_risks": sum(1 for risk in selected_risks if risk.status not in {"Mitigated", "Completed"}),
            "high_risks": sum(1 for risk in selected_risks if risk.impact == "High"),
            "overdue_risks": sum(1 for risk in selected_risks if risk.status == "Overdue"),
            "average_probability_pct": avg_probability,
            "average_impact_score": avg_impact,
        },
        risks=risks,
        owner_exposures=build_owner_exposures(selected_risks),
    )


def main() -> None:
    today = date.today()
    payload = fetch_powerautomate_payload()
    tasks = transform_tasks(payload, today)
    selected_sprint = max((task.sprint for task in tasks if task.sprint), key=sprint_number)
    selected_risks = build_risks(tasks, selected_sprint, today)
    risks = build_all_risks(tasks, today)

    result = {
        "PowerAutomateWbsPayload": dump_model(payload),
        "ProgressTaskResponse": dump_model(build_progress_response(tasks, selected_sprint, today)),
        "DashboardResponse": dump_model(build_dashboard_response(tasks, selected_risks, selected_sprint)),
        "RiskPredictionResponse": dump_model(build_risk_response(risks, selected_sprint)),
    }

    OUTPUT_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    for schema_name, path in COMPONENT_OUTPUTS.items():
        path.write_text(json.dumps(result[schema_name], ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"selected_sprint={selected_sprint}")
    print(f"raw_tasks={len(payload.raw_tasks)}")
    print(f"progress_tasks={len(result['ProgressTaskResponse']['tasks'])}")
    print(f"dashboard_attention_tasks={len(result['DashboardResponse']['attention_tasks'])}")
    print(f"risks={len(result['RiskPredictionResponse']['risks'])}")
    print(f"output={OUTPUT_PATH}")
    for schema_name, path in COMPONENT_OUTPUTS.items():
        print(f"{schema_name}_output={path}")


if __name__ == "__main__":
    main()
