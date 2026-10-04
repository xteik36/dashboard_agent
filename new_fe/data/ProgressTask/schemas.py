from pydantic import BaseModel, Field

from data.common.schemas import TaskItemSchema


# Schema KPI nho cho cac card dau man Progress Task.
class ProgressTaskMetricSchema(BaseModel):
    # Key on dinh de frontend map icon/style, vi du overdue_tasks hoac at_risk_tasks.
    key: str
    # Label hien thi tren card KPI.
    label: str
    # Gia tri hien tai sau khi tinh tu danh sach task da transform.
    value: int | float
    # Chuoi delta ngan de hien thi so sanh, vi du +2 vs last sprint.
    delta: str | None = None


# Schema tong cho component ProgressTaskView, chua phai API endpoint.
class ProgressTaskResponse(BaseModel):
    # Project hien tai cua data sau transform, mac dinh co the la PMA Agent.
    project: str
    # Sprint dang duoc chon hoac All open sprints de frontend khoi tao filter.
    selected_sprint: str = Field(alias="selectedSprint")
    # Danh sach sprint co trong payload PowerAutomate sau khi normalize.
    sprint_options: list[str] = Field(alias="sprintOptions")
    # Cac card KPI tinh truc tiep tu tasks: overdue, at risk, velocity, today due.
    metrics: list[ProgressTaskMetricSchema]
    # Danh sach task da chuan hoa khop TaskItem cua frontend.
    tasks: list[TaskItemSchema]
    # Id task nen duoc focus ban dau trong drawer, thuong la task overdue/at risk dau tien.
    default_task_id: str | None = Field(default=None, alias="defaultTaskId")
