from pydantic import BaseModel, Field

from data.common.schemas import RiskItemSchema


class RiskPredictionResponse(BaseModel):
    # Response schema toi thieu cho RiskPredictionsView.
    # Chi giu 1 response schema cho component; formula/summary/owner_exposures dung dict de giam class phu.

    # Sprint dang duoc chon tren UI.
    selected_sprint: str

    # Cong thuc risk lay tu file "Tinh Impact va Probability.docx".
    # Probability = average(deadline_weight cua active tasks) * 100.
    # Impact = 1 + 4 * affected_tasks / total_tasks.
    # Goi y keys:
    # probability_weights = {days_gt_14: 0.10, days_8_to_14: 0.30, days_4_to_7: 0.50,
    # days_1_to_3: 0.75, due_today: 0.90, overdue: 1.00}, impact_min = 1, impact_max = 5.
    formula: dict[str, dict[str, float] | float] = Field(default_factory=dict)

    # Summary cho overview.
    # Goi y keys: total_risks, critical_risks, high_risks, overdue_risks,
    # average_probability_pct, average_impact_score.
    summary: dict[str, int | float]

    # Danh sach risk da tinh tu PowerAutomate rawTasks.
    risks: list[RiskItemSchema]

    # Bang Owner Risk Exposure group tu risks theo owner.
    # Moi item goi y keys: rank, name, role, initials, avatar_color, total_risks,
    # critical_count, high_count, medium_count, risk_score, max_score, overdue_count, top_threat_risk.
    owner_exposures: list[dict[str, str | int | float | None]]
