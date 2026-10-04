from pydantic import BaseModel

from data.common.schemas import TaskItemSchema


class DashboardResponse(BaseModel):
    # Response schema toi thieu cho DashboardView.
    # Chi giu 1 response schema cho component; cac card/chart dung dict de giam so schema.

    # Sprint dang duoc chon tren dashboard.
    selected_sprint: str

    # Summary theo sprint derive tu TaskItemSchema.
    # Goi y keys: total_tasks, completed_count, completed_rate_pct, in_progress_count,
    # pending_count, overdue_count.
    sprint_summary: dict[str, int | float]

    # Card Sprint Health.
    # Goi y keys: label, value, status, delta_vs_previous_sprint.
    sprint_health: dict[str, str | int | float | None]

    # Card Critical Risk.
    # Goi y keys: label, value, status, delta_vs_previous_sprint.
    critical_risk: dict[str, str | int | float | None]

    # Card Audit Pending de optional vi PowerAutomate WBS hien chua co audit-doc fields.
    # Neu chua co source data thi backend co the tra None.
    audit_pending: dict[str, str | int | float | None] | None = None

    # Sprint Delivery Trend.
    # Moi item goi y keys: sprint, created, completed.
    delivery_trend: list[dict[str, str | int]]

    # Risk matrix tren Dashboard, lay tu RiskItemSchema/RiskPrediction sau khi tinh risk.
    # Moi item goi y keys: impact, probability, count.
    risk_distribution: list[dict[str, str | int]]

    # Cac task can chu y hien o dashboard, lay tu tasks sap xep theo overdue/priority/due_date.
    attention_tasks: list[TaskItemSchema]

    # Metric tong task.
    # Goi y keys: count, rate_pct.
    total_tasks: dict[str, int | float]
