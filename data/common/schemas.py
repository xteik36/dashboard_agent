from typing import Literal

from pydantic import BaseModel, Field


PriorityLevel = Literal["Critical", "High", "Medium", "Low"]
TaskStatus = Literal["Completed", "In Progress", "Pending", "Overdue", "To Do"]
RiskImpact = Literal["Low", "Medium", "High", "Critical"]
RiskProbability = Literal["Low", "Medium", "High"]
RiskStatus = Literal["Open", "Mitigated", "Monitoring", "In Progress", "Overdue", "Planned", "On Track"]


class PowerAutomateTaskRaw(BaseModel):
    # Schema goc cho 1 row trong PowerAutomate msg.rawTasks.
    # Dung schema nay de validate data vao truoc khi transform sang TaskItemSchema/RiskItemSchema.

    # Noi dung task tren PowerAutomate, map truc tiep tu field "Detail".
    detail: str = Field(default="", alias="Detail")

    # FunctionID goc; chi row co dang so nhu 1 hoac 1.1 moi duoc xem la task that.
    function_id: str | int | float = Field(default="", alias="FunctionID")

    # Loai task hoac nhom nguon, vi du Planner/Non Planner, map tu field "Type".
    type: str = Field(default="", alias="Type")

    # Do uu tien goc tu PowerAutomate; service layer normalize ve Critical/High/Medium/Low.
    priority: str = Field(default="", alias="Priority")

    # Tien do goc co the la "1", "0.5", 1 hoac 0.5; service layer doi sang percent 0-100.
    progress: str | float | int = Field(default=0, alias="Progress")

    # PIC/assignee goc; service layer tach owner name, initials va group theo owner khi can.
    pic: str = Field(default="", alias="PIC")

    # Trang thai goc, vi du Done/In-progress; service layer normalize ve TaskStatus.
    status: str = Field(default="", alias="Status")

    # Sprint goc, vi du Sprint18; dung de filter va tinh trend theo sprint.
    sprint: str = Field(default="", alias="Sprint")

    # Ngay bat dau ke hoach; optional vi PowerAutomate co row bi trong.
    plan_start: str = Field(default="", alias="PlanStart")

    # Ngay ket thuc ke hoach; dung de tinh due_date, overdue va probability deadline risk.
    plan_end: str = Field(default="", alias="PlanEnd")


class PowerAutomateWbsPayload(BaseModel):
    # Schema cho msg tra ve tu PowerAutomate WBS flow.
    # Day la input contract chung cho backend FastAPI sau nay.

    # Tong so task PowerAutomate tra ve; dung de doi chieu voi len(raw_tasks).
    total: int

    # Danh sach task goc; day la source duy nhat de tinh ProgressTask, Dashboard va RiskPrediction.
    raw_tasks: list[PowerAutomateTaskRaw] = Field(default_factory=list, alias="rawTasks")


class TaskItemSchema(BaseModel):
    # Schema task da normalize cho frontend.
    # Dung chung cho ProgressTask va Dashboard de khong tao nhieu schema lap lai.

    # ID backend tu sinh, vi PowerAutomate rawTasks hien chua co Task ID rieng.
    id: str

    # So thu tu hien thi trong bang UI; co the lay index + 1 khi transform.
    st: int | None = None

    # FunctionID goc tu PowerAutomate WBS, vi du 1, 1.1, 2.3.
    function_id: str | None = None

    # Ten task hien tren UI, map tu PowerAutomateTaskRaw.detail.
    title: str

    # Project hoac loai task hien tren UI; co the map tu type hoac default theo workspace.
    project: str | None = None

    # Priority da normalize tu raw priority; neu raw rong thi service layer co the default Medium.
    priority: PriorityLevel

    # Tien do percent 0-100; raw progress 1 -> 100, 0.5 -> 50.
    progress: int = Field(ge=0, le=100)

    # Due date hien tren UI; map tu plan_end va format trong service layer.
    due_date: str

    # Owner object gom name/initials/avatar_color/role; derive tu PIC de tranh them Owner schema rieng.
    owner: dict[str, str | None]

    # Status da normalize; Done -> Completed, In-progress -> In Progress, overdue tinh them tu plan_end.
    status: TaskStatus

    # Sprint cua task, map tu PowerAutomateTaskRaw.sprint.
    sprint: str | None = None

    # Boolean tien loi cho checkbox UI; true khi status la Completed hoac progress = 100.
    completed: bool = False

    # Loai nguon goc, map tu PowerAutomateTaskRaw.type de debug/filter neu can.
    source_type: str | None = None


class RiskItemSchema(BaseModel):
    # Schema risk da tinh tu rawTasks theo cong thuc trong file docx.
    # Dung chung cho RiskPrediction va Dashboard risk_distribution.

    # ID risk backend tu sinh theo sprint/project/owner hoac theo index.
    id: str

    # Ten risk ngan hien trong table; co the derive tu project/type/owner.
    risk_name: str

    # Sprint ma risk thuoc ve; dung de filter RiskPrediction theo sprint.
    sprint: str | None = None

    # Mo ta risk; nen ghi ly do risk duoc tao, vi du overdue/high deadline pressure.
    title: str

    # Impact label derive tu impact_score.
    impact: RiskImpact

    # Impact = 1 + 4 * affected_tasks / total_tasks, nam trong khoang 1-5.
    impact_score: float = Field(ge=1, le=5)

    # Probability label derive tu probability_pct.
    probability: RiskProbability

    # Probability = average(deadline_weight cua active tasks) * 100.
    probability_pct: float = Field(ge=0, le=100)

    # Risk score de sort/display; goi y: probability_pct / 100 * impact_score * 5.
    score: float = Field(ge=0)

    # Status risk sau khi tinh toan; Overdue/In Progress/On Track... de match UI.
    status: RiskStatus

    # Owner chinh cua risk, derive tu PIC hoac nhom task.
    owner: str

    # Initials derive tu owner, dung cho avatar UI.
    owner_initials: str | None = None

    # Mau avatar owner; service layer co the gan theo hash ten owner.
    owner_avatar_color: str | None = None

    # Due date dai dien cho risk, thuong la PlanEnd gan nhat/qua han trong nhom.
    due_date: str | None = None

    # Text hien UI nhu "Overdue 2 days" hoac "In 6 days", tinh tu due_date.
    due_relative: str | None = None

    # Goi y mitigation hien trong modal review; service layer co the tao theo loai risk.
    mitigation_plan: str

    # Function/project bi anh huong, derive tu Type/project/task group.
    affected_function: str | None = None

    # So task bi anh huong trong nhom, dung trong cong thuc impact.
    affected_tasks: int

    # Tong task trong project/sprint/owner group, dung trong cong thuc impact.
    total_tasks: int
