from typing import Literal

from pydantic import BaseModel, Field

from data.common.schemas import TaskItemSchema


# Schema 1 card KPI tren Dashboard, dung chung cho Sprint Health/Critical Risk/Audit Pending.
class DashboardMetricSchema(BaseModel):
    # Key on dinh de frontend biet card nao dang duoc render.
    key: str
    # Label hien thi tren Dashboard.
    label: str
    # Gia tri chinh cua KPI, giu dang str de ho tro ca so dem va phan tram nhu 94.2%.
    value: str
    # Trang thai ngan cua KPI, vi du On Track, Need PM Check hoac Critical.
    status: str
    # Delta so sanh voi sprint truoc neu transform co du lieu lich su.
    delta: str | None = None


# Schema tom tat 1 sprint, khop voi SprintInfo ma Dashboard dang render.
class DashboardSprintSchema(BaseModel):
    # Id sprint on dinh de click xem chi tiet.
    id: str
    # Ten sprint hien thi, vi du Sprint 35.
    name: str
    # Badge suc khoe sprint theo UI hien tai.
    badge: Literal["On Track", "At Risk", "Delay Risk"]
    # Phan tram hoan thanh cua sprint, tinh bang completed_tasks / total_tasks * 100 va lam tron 2 chu so thap phan.
    progress: float = Field(ge=0, le=100)
    # Tong task trong sprint.
    total_tasks: int = Field(alias="totalTasks")
    # So task completed trong sprint.
    completed_tasks: int = Field(alias="completedTasks")
    # So task overdue trong sprint.
    overdue_tasks: int = Field(alias="overdueTasks")
    # So task at risk trong sprint.
    at_risk_tasks: int = Field(alias="atRiskTasks")
    # Chuoi ngay con lai de hien thi, tinh tu PlanEnd gan nhat/chung cua sprint.
    days_remaining: str = Field(alias="daysRemaining")
    # Cac task quan trong nhat cua sprint de render danh sach nho.
    key_tasks: list[dict[str, str]] = Field(default_factory=list, alias="keyTasks")


# Schema 1 diem chart delivery theo sprint tren Dashboard.
class DashboardDeliveryPointSchema(BaseModel):
    # Ten sprint tren truc X.
    sprint: str
    # So task duoc tao/nam trong sprint theo rawTasks.
    created: int
    # So task completed trong sprint.
    completed: int
    # Ti le completed / created, tinh theo phan tram 0-100 va lam tron 2 chu so thap phan.
    completion_rate: float = Field(alias="completionRate", ge=0, le=100)


# Schema tong cho component DashboardView, chua phai API endpoint.
class DashboardResponse(BaseModel):
    # Project dang xem tren Dashboard.
    project: str
    # Scope sprint dang xem, vi du All open sprints.
    selected_sprint: str = Field(alias="selectedSprint")
    # Danh sach option sprint/project de frontend render dropdown.
    sprint_options: list[str] = Field(alias="sprintOptions")
    # Cac KPI dau Dashboard.
    metrics: list[DashboardMetricSchema]
    # Du lieu chart Sprint Delivery Trend.
    delivery_trend: list[DashboardDeliveryPointSchema] = Field(alias="deliveryTrend")
    # Danh sach sprint health ben Dashboard.
    sprints: list[DashboardSprintSchema]
    # Cac task can chu y duoi Dashboard, lay lai TaskItemSchema de tranh tao model moi.
    attention_tasks: list[TaskItemSchema] = Field(alias="attentionTasks")
