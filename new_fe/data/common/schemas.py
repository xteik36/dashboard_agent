from typing import Literal

from pydantic import BaseModel, Field


# Schema mo ta 1 dong task raw lay truc tiep tu PowerAutomate.
class PowerAutomateTaskRaw(BaseModel):
    # Ma task neu payload co san; neu PowerAutomate khong tra ve thi transform co the sinh tu index.
    id: str | None = Field(default=None)
    # Ten hoac noi dung chinh cua task, map tu cot Detail trong PowerAutomate.
    detail: str = Field(alias="Detail")
    # Nhom/loai cong viec, co the dung lam subtitle hoac project khi frontend can gom nhom.
    type: str | None = Field(default=None, alias="Type")
    # Do uu tien goc tu PowerAutomate; transform se chuan hoa ve Critical/High/Medium/Low.
    priority: str | None = Field(default=None, alias="Priority")
    # Tien do dang so hoac chuoi phan tram; transform se ep ve 0-100.
    progress: int | float | str | None = Field(default=None, alias="Progress")
    # Nguoi phu trach chinh, map sang owner.name tren frontend.
    pic: str | None = Field(default=None, alias="PIC")
    # Trang thai goc cua task; transform se chuan hoa ve status cua frontend.
    status: str | None = Field(default=None, alias="Status")
    # Sprint goc, vi du Sprint 35/Sprint18; dung cho filter va chart theo sprint.
    sprint: str | None = Field(default=None, alias="Sprint")
    # Ngay bat dau ke hoach; giu dang chuoi de chap nhan nhieu format Excel/PowerAutomate.
    plan_start: str | None = Field(default=None, alias="PlanStart")
    # Ngay ket thuc ke hoach; dung de tinh dueDate, overdue va risk.
    plan_end: str | None = Field(default=None, alias="PlanEnd")


# Schema mo ta payload WBS tong tu PowerAutomate, truoc khi bien doi cho frontend.
class PowerAutomateWbsPayload(BaseModel):
    # Tong so task PowerAutomate bao cao; dung de doi chieu voi len(raw_tasks).
    total: int | None = Field(default=None)
    # Danh sach task raw dung lam nguon duy nhat de transform sang cac schema component.
    raw_tasks: list[PowerAutomateTaskRaw] = Field(default_factory=list, alias="rawTasks")


# Schema dung chung cho avatar/owner trong nhieu component frontend.
class OwnerSchema(BaseModel):
    # Ten hien thi cua nguoi phu trach, lay tu PIC hoac gia tri fallback khi thieu PIC.
    name: str
    # Chu cai viet tat de render avatar tron tren UI.
    initials: str
    # Class mau nen avatar tu Tailwind, vi du bg-blue-500.
    avatar_bg: str = Field(alias="avatarBg")


# Schema task sau khi da transform, khop voi TaskItem dang dung trong React.
class TaskItemSchema(BaseModel):
    # Ma task on dinh de frontend chon task, mo drawer va update local state.
    id: str
    # Ten task hien thi trong table/card, map tu Detail.
    title: str
    # Mo ta phu, thuong lay tu Type hoac thong tin bo sung neu co.
    subtitle: str | None = None
    # Ten project/workspace de filter tren Dashboard va Progress Task.
    project: str
    # Sprint cua task de loc tab, tinh chart va dashboard scope.
    sprint: str
    # Owner da chuan hoa tu PIC.
    owner: OwnerSchema
    # Do uu tien da chuan hoa theo frontend.
    priority: Literal["Critical", "High", "Medium", "Low"]
    # Trang thai da chuan hoa theo frontend.
    status: Literal["In Progress", "Overdue", "At Risk", "Completed", "Planned", "Blocked"]
    # Phan tram tien do 0-100, transform tu Progress.
    progress: int = Field(ge=0, le=100)
    # Due date dang label ngan cho UI, vi du Today hoac 2026-09-30.
    due_date: str = Field(alias="dueDate")
    # Ly do block/risk neu transform suy luan tu status, due date hoac field nguon.
    blocker_reason: str | None = Field(default=None, alias="blockerReason")
    # Subtask toi gian de UI drawer tinh completed/progress; co the sinh 1 item tu task raw neu PowerAutomate chua co subtask.
    subtasks: list[dict[str, str | bool]] = Field(default_factory=list)
