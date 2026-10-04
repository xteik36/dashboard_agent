from pydantic import BaseModel

from data.common.schemas import TaskItemSchema


class ProgressTaskResponse(BaseModel):
    # Response schema toi thieu cho component ProgressTasksView.
    # Chi giu 1 response schema cho component; summary/tabs/chart de dang dict de tranh tao class phu.

    # Sprint dang duoc chon tren UI.
    selected_sprint: str

    # Summary derive tu tasks trong selected_sprint.
    # Goi y keys: total_tasks, completed_count, completed_rate_pct, in_progress_count,
    # pending_count, overdue_count, overdue_rate_pct.
    summary: dict[str, int | float]

    # Count cho 3 tab overview.
    # Goi y keys: today_count, overdue_count, completed_count.
    tabs: dict[str, int]

    # Data stacked bar chart theo sprint.
    # Moi item goi y keys: sprint, completed, in_progress, to_do, overdue, is_current.
    sprint_chart: list[dict[str, str | int | bool]]

    # Danh sach task da normalize; frontend dung de search/filter/export/table.
    tasks: list[TaskItemSchema]
