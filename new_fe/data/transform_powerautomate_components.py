import json
import sys
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

import requests

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from data.Dashboard.schemas import DashboardResponse
from data.ProgressTask.schemas import ProgressTaskResponse
from data.common.schemas import PowerAutomateWbsPayload, TaskItemSchema


ROOT_DIR = Path(__file__).resolve().parent
PROJECT_NAME = "PMA Agent"
SELECTED_SPRINT = "All open sprints"
AVATAR_COLORS = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-rose-500",
    "bg-cyan-500",
]


def read_flow_url() -> str:
    from data.get_data_powerautomate import get_flow_url

    return get_flow_url()


def fetch_powerautomate_payload() -> PowerAutomateWbsPayload:
    # Goi PowerAutomate va validate phan msg bang schema raw dung chung.
    response = requests.post(read_flow_url(), json={}, timeout=120)
    response.raise_for_status()
    body = response.json()
    return PowerAutomateWbsPayload.model_validate(body["msg"])


def parse_percent(value: Any) -> int:
    # Chuan hoa Progress ve 0-100, chap nhan so, "75%" hoac chuoi rong.
    if value is None:
        return 0
    if isinstance(value, str):
        text = value.strip().replace("%", "")
        if not text:
            return 0
        value = float(text)
    if isinstance(value, float) and 0 < value <= 1:
        value = value * 100
    return max(0, min(100, round(float(value))))


def parse_date(value: Any) -> date | None:
    # PowerAutomate/Excel co the tra ISO date, datetime string hoac serial number.
    if value in (None, ""):
        return None
    if isinstance(value, (int, float)):
        return date(1899, 12, 30) + timedelta(days=int(value))
    text = str(value).strip()
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%m/%d/%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(text[:19], fmt).date()
        except ValueError:
            pass
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).date()
    except ValueError:
        return None


def format_due_date(plan_end: Any) -> str:
    # Tao label dueDate cho frontend tu PlanEnd.
    due = parse_date(plan_end)
    if due is None:
        return "No due date"
    today = date.today()
    if due == today:
        return "Today"
    if due == today + timedelta(days=1):
        return "Tomorrow"
    if due == today - timedelta(days=1):
        return "Yesterday"
    return due.isoformat()


def initials(name: str) -> str:
    # Sinh initials cho avatar tu PIC.
    parts = [part for part in name.replace(".", " ").split() if part]
    if not parts:
        return "NA"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def normalize_priority(value: str | None, status: str | None, progress: int, due: date | None) -> str:
    # Chuan hoa priority theo enum frontend, co fallback theo deadline/progress.
    text = (value or "").strip().lower()
    if "critical" in text or "urgent" in text:
        return "Critical"
    if "high" in text:
        return "High"
    if "low" in text:
        return "Low"
    status_text = (status or "").lower()
    if "block" in status_text or (due and due < date.today() and progress < 100):
        return "Critical"
    if due and due <= date.today() + timedelta(days=3) and progress < 80:
        return "High"
    return "Medium"


def normalize_status(status: str | None, progress: int, due: date | None) -> str:
    # Chuan hoa status theo enum frontend, uu tien Completed/Blocked/Overdue.
    text = (status or "").strip().lower()
    if progress >= 100 or any(token in text for token in ("done", "complete", "completed")):
        return "Completed"
    if "block" in text:
        return "Blocked"
    if due and due < date.today():
        return "Overdue"
    if "risk" in text or (due and due <= date.today() + timedelta(days=7) and progress < 80):
        return "At Risk"
    if any(token in text for token in ("plan", "todo", "not start", "new")) or progress == 0:
        return "Planned"
    return "In Progress"


def transform_tasks(payload: PowerAutomateWbsPayload) -> list[TaskItemSchema]:
    # Bien rawTasks thanh TaskItemSchema de dung chung cho ProgressTask va Dashboard.
    tasks: list[TaskItemSchema] = []
    for index, raw in enumerate(payload.raw_tasks, start=1):
        progress = parse_percent(raw.progress)
        due = parse_date(raw.plan_end)
        owner_name = (raw.pic or "Unassigned").strip() or "Unassigned"
        status = normalize_status(raw.status, progress, due)
        priority = normalize_priority(raw.priority, raw.status, progress, due)
        task_id = raw.id or f"TSK-{index:04d}"
        task = TaskItemSchema.model_validate(
            {
                "id": task_id,
                "title": raw.detail.strip() if raw.detail else f"Task {index}",
                "subtitle": raw.type,
                "project": PROJECT_NAME,
                "sprint": raw.sprint or "Unassigned Sprint",
                "owner": {
                    "name": owner_name,
                    "initials": initials(owner_name),
                    "avatarBg": AVATAR_COLORS[index % len(AVATAR_COLORS)],
                },
                "priority": priority,
                "status": status,
                "progress": progress,
                "dueDate": format_due_date(raw.plan_end),
                "blockerReason": (
                    "Task qua han theo PlanEnd"
                    if status == "Overdue"
                    else "Task co nguy co tre theo PlanEnd/Progress"
                    if status == "At Risk"
                    else None
                ),
                "subtasks": [
                    {
                        "id": f"{task_id}-1",
                        "title": raw.detail.strip() if raw.detail else f"Task {index}",
                        "completed": progress >= 100,
                    }
                ],
            }
        )
        tasks.append(task)
    return tasks


def sprint_sort_key(name: str) -> tuple[int, str]:
    # Sap xep sprint co so theo dung thu tu tu nhien.
    digits = "".join(ch for ch in name if ch.isdigit())
    return (int(digits) if digits else 9999, name)


def build_progress_task_response(tasks: list[TaskItemSchema]) -> ProgressTaskResponse:
    # Tong hop schema cho component ProgressTaskView.
    sprint_options = [SELECTED_SPRINT] + sorted({task.sprint for task in tasks}, key=sprint_sort_key)
    overdue_count = sum(task.status == "Overdue" for task in tasks)
    at_risk_count = sum(task.status == "At Risk" for task in tasks)
    today_due_count = sum(task.due_date == "Today" for task in tasks)
    completed_count = sum(task.status == "Completed" for task in tasks)
    velocity = round((completed_count / len(tasks)) * 100) if tasks else 0
    default_task = next((task for task in tasks if task.status in ("Overdue", "At Risk")), tasks[0] if tasks else None)
    return ProgressTaskResponse.model_validate(
        {
            "project": PROJECT_NAME,
            "selectedSprint": SELECTED_SPRINT,
            "sprintOptions": sprint_options,
            "metrics": [
                {"key": "overdue_tasks", "label": "Overdue Tasks", "value": overdue_count, "delta": None},
                {"key": "at_risk_tasks", "label": "At Risk Tasks", "value": at_risk_count, "delta": None},
                {"key": "sprint_velocity", "label": "Sprint Velocity", "value": velocity, "delta": None},
                {"key": "today_due", "label": "Today's Due", "value": today_due_count, "delta": None},
            ],
            "tasks": [task.model_dump(by_alias=True) for task in tasks],
            "defaultTaskId": default_task.id if default_task else None,
        }
    )


def build_dashboard_response(tasks: list[TaskItemSchema]) -> DashboardResponse:
    # Tong hop schema cho component DashboardView tu cung danh sach TaskItemSchema.
    sprint_options = [SELECTED_SPRINT] + sorted({task.sprint for task in tasks}, key=sprint_sort_key)
    by_sprint: dict[str, list[TaskItemSchema]] = defaultdict(list)
    for task in tasks:
        by_sprint[task.sprint].append(task)

    delivery_trend = []
    sprint_cards = []
    for sprint in sprint_options[1:]:
        sprint_tasks = by_sprint[sprint]
        total = len(sprint_tasks)
        completed = sum(task.status == "Completed" for task in sprint_tasks)
        overdue = sum(task.status == "Overdue" for task in sprint_tasks)
        at_risk = sum(task.status == "At Risk" for task in sprint_tasks)
        progress = round((completed / total) * 100, 2) if total else 0
        badge = "Delay Risk" if overdue else "At Risk" if at_risk else "On Track"
        delivery_trend.append(
            {"sprint": sprint, "created": total, "completed": completed, "completionRate": progress}
        )
        key_tasks = [
            {"name": task.title, "status": task.status, "owner": task.owner.name}
            for task in sorted(
                sprint_tasks,
                key=lambda task: (task.status not in ("Overdue", "At Risk", "Blocked"), -task.progress),
            )[:3]
        ]
        sprint_cards.append(
            {
                "id": sprint.lower().replace(" ", "-"),
                "name": sprint,
                "badge": badge,
                "progress": progress,
                "totalTasks": total,
                "completedTasks": completed,
                "overdueTasks": overdue,
                "atRiskTasks": at_risk,
                "daysRemaining": "See task due dates",
                "keyTasks": key_tasks,
            }
        )

    total_tasks = len(tasks)
    completed_total = sum(task.status == "Completed" for task in tasks)
    sprint_health = round((completed_total / total_tasks) * 100, 2) if total_tasks else 0
    critical_risk = sum(task.priority == "Critical" or task.status in ("Overdue", "Blocked") for task in tasks)
    attention_tasks = [
        task
        for task in sorted(
            tasks,
            key=lambda task: (task.status not in ("Overdue", "At Risk", "Blocked"), task.priority != "Critical"),
        )
        if task.status in ("Overdue", "At Risk", "Blocked") or task.priority == "Critical"
    ][:10]
    return DashboardResponse.model_validate(
        {
            "project": PROJECT_NAME,
            "selectedSprint": SELECTED_SPRINT,
            "sprintOptions": sprint_options,
            "metrics": [
                {
                    "key": "sprint_health",
                    "label": "Sprint Health",
                    "value": f"{sprint_health}%",
                    "status": "On Track" if sprint_health >= 80 else "At Risk",
                    "delta": None,
                },
                {
                    "key": "critical_risk",
                    "label": "Critical Risk",
                    "value": str(critical_risk),
                    "status": "Critical" if critical_risk else "On Track",
                    "delta": None,
                },
                {
                    "key": "audit_pending",
                    "label": "Audit Pending",
                    "value": "0",
                    "status": "No audit data in WBS payload",
                    "delta": None,
                },
            ],
            "deliveryTrend": delivery_trend,
            "sprints": sprint_cards,
            "attentionTasks": [task.model_dump(by_alias=True) for task in attention_tasks],
        }
    )


def write_json(path: Path, value: Any) -> None:
    # Ghi JSON day du de xem toan bo gia tri schema da transform.
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    payload = fetch_powerautomate_payload()
    tasks = transform_tasks(payload)
    progress_response = build_progress_task_response(tasks)
    dashboard_response = build_dashboard_response(tasks)

    progress_path = ROOT_DIR / "ProgressTask" / "transformed_powerautomate.json"
    dashboard_path = ROOT_DIR / "Dashboard" / "transformed_powerautomate.json"
    write_json(progress_path, progress_response.model_dump(by_alias=True))
    write_json(dashboard_path, dashboard_response.model_dump(by_alias=True))

    status_counts = Counter(task.status for task in tasks)
    print(json.dumps(
        {
            "raw_total": payload.total,
            "transformed_tasks": len(tasks),
            "status_counts": status_counts,
            "progress_task_file": str(progress_path),
            "dashboard_file": str(dashboard_path),
            "progress_task_schema_values_preview": progress_response.model_dump(by_alias=True, exclude={"tasks"}),
            "dashboard_schema_values_preview": dashboard_response.model_dump(
                by_alias=True,
                exclude={"attentionTasks"},
            ),
        },
        ensure_ascii=False,
        indent=2,
        default=dict,
    ))


if __name__ == "__main__":
    main()
