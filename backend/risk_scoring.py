"""Canonical PAIMANA decision scoring.

Scores are prototype decision-support thresholds, not official government
classifications. All batch, API, and frontend-export code must use these
functions.
"""
from __future__ import annotations

import math
from typing import Mapping

RISK_SCORING_VERSION = "risk-scoring-v1"
PRIORITY_WEIGHTS = {
    "cost": 0.35,
    "time": 0.30,
    "escalation": 0.15,
    "scale": 0.20,
}
SCALE_REFERENCE_COST_CR = 50_000.0


def _number(value: object, default: float = 0.0) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return default
    return number if math.isfinite(number) else default


def calculate_scale_score(original_cost_cr: object) -> float:
    cost = max(_number(original_cost_cr), 1.0)
    return min(100.0, max(0.0, math.log1p(cost) / math.log1p(SCALE_REFERENCE_COST_CR) * 100.0))


def calculate_priority_score(
    cost_risk_pct: object,
    time_risk_pct: object,
    forward_escalation_risk_pct: object = 0.0,
    original_cost_cr: object = 0.0,
) -> float:
    score = (
        PRIORITY_WEIGHTS["cost"] * _number(cost_risk_pct)
        + PRIORITY_WEIGHTS["time"] * _number(time_risk_pct)
        + PRIORITY_WEIGHTS["escalation"] * _number(forward_escalation_risk_pct)
        + PRIORITY_WEIGHTS["scale"] * calculate_scale_score(original_cost_cr)
    )
    return round(min(100.0, max(0.0, score)), 1)


def determine_risk_band(priority_score: object, cost_risk_pct: object, time_risk_pct: object) -> str:
    score = _number(priority_score)
    cost = _number(cost_risk_pct)
    time = _number(time_risk_pct)
    if score >= 70.0 or (cost >= 75.0 and time >= 75.0):
        return "CRITICAL"
    if score >= 50.0 or cost >= 65.0 or time >= 65.0:
        return "HIGH"
    if score >= 30.0:
        return "MEDIUM"
    return "LOW"


def score_record(record: Mapping[str, object]) -> dict[str, object]:
    priority = calculate_priority_score(
        record.get("cost_risk_pct", record.get("cost_risk_score", 0.0)),
        record.get("time_risk_pct", record.get("time_risk_score", 0.0)),
        record.get("forward_escalation_risk_pct", 0.0),
        record.get("original_cost_cr", 0.0),
    )
    cost = _number(record.get("cost_risk_pct", record.get("cost_risk_score", 0.0)))
    time = _number(record.get("time_risk_pct", record.get("time_risk_score", 0.0)))
    return {
        "priority_score": priority,
        "risk_band": determine_risk_band(priority, cost, time),
    }