EXEMPTION_RULES = {
    "特定居住用宅地": {"max_area": 330, "rate": 0.8},
    "特定事業用宅地": {"max_area": 400, "rate": 0.8},
    "貸付事業用宅地": {"max_area": 200, "rate": 0.5},
}


def evaluate_land(route_price_per_sqm: int, area_sqm: float, ownership_ratio: float = 100) -> int:
    return int(route_price_per_sqm * area_sqm * ownership_ratio / 100)


def apply_exemption(raw_value: int, area_sqm: float, exemption_type: str, ownership_ratio: float = 100) -> dict:
    if exemption_type == "none" or exemption_type not in EXEMPTION_RULES:
        return {"reduction": 0, "after_value": raw_value, "eligible_area": 0}

    rule = EXEMPTION_RULES[exemption_type]
    eligible_area = min(area_sqm, rule["max_area"])
    eligible_ratio = eligible_area / area_sqm if area_sqm > 0 else 0
    reduction = int(raw_value * eligible_ratio * rule["rate"] * ownership_ratio / 100)

    return {
        "reduction": reduction,
        "after_value": raw_value - reduction,
        "eligible_area": eligible_area,
        "max_area": rule["max_area"],
        "rate": rule["rate"],
    }
