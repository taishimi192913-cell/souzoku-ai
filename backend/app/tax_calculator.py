from typing import Optional


TAX_BRACKETS = [
    (0, 10_000_000, 0.10, 0),
    (10_000_000, 30_000_000, 0.15, 500_000),
    (30_000_000, 50_000_000, 0.20, 2_000_000),
    (50_000_000, 100_000_000, 0.30, 7_000_000),
    (100_000_000, 200_000_000, 0.40, 17_000_000),
    (200_000_000, 300_000_000, 0.45, 27_000_000),
    (300_000_000, 600_000_000, 0.50, 42_000_000),
    (600_000_000, float("inf"), 0.55, 72_000_000),
]

STATUTORY_SHARES: dict[str, list[tuple[str, float]]] = {
    "配偶者のみ": [("配偶者", 1.0)],
    "配偶者_子": [("配偶者", 0.5), ("子", 0.5)],
    "配偶者_親": [("配偶者", 2 / 3), ("親", 1 / 3)],
    "配偶者_孫": [("配偶者", 0.5), ("孫", 0.5)],
    "子のみ": [("子", 1.0)],
    "親のみ": [("親", 1.0)],
    "孫のみ": [("孫", 1.0)],
}


def compute_tax_for_amount(amount: int) -> int:
    if amount <= 0:
        return 0
    for lo, hi, rate, deduct in TAX_BRACKETS:
        if lo < amount <= hi:
            return int(amount * rate - deduct)
    return int(amount * 0.55 - 72_000_000)


def detect_family_pattern(family: list) -> str:
    has_spouse = any(m.relation == "配偶者" for m in family)
    has_child = any(m.relation == "子" for m in family)
    has_parent = any(m.relation == "親" for m in family)
    has_grandchild = any(m.relation == "孫" for m in family)

    if has_spouse and has_child:
        return "配偶者_子"
    if has_spouse and has_parent:
        return "配偶者_親"
    if has_spouse and has_grandchild:
        return "配偶者_孫"
    if has_spouse:
        return "配偶者のみ"
    if has_child:
        return "子のみ"
    if has_parent:
        return "親のみ"
    if has_grandchild:
        return "孫のみ"
    return "子のみ"


def compute_family_shares(family: list) -> list[float]:
    pattern = detect_family_pattern(family)
    share_template = STATUTORY_SHARES.get(pattern, [("子", 1.0)])

    result = []
    category_count: dict[str, int] = {}
    for rel, _ in share_template:
        count = sum(1 for m in family if m.relation == rel)
        category_count[rel] = count

    for m in family:
        cat_share = 0
        for rel, share in share_template:
            if m.relation == rel:
                cat_share = share
                break
        count = category_count.get(m.relation, 1)
        result.append(cat_share / count if count > 0 else 0)

    return result


def legacy_heir_count(family: list) -> int:
    return max(1, sum(1 for m in family if m.relation in ("配偶者", "子", "親", "孫")))


def calculate_tax(family: list, total_taxable: int, shares: list[float], actual_shares: Optional[list[float]] = None) -> dict:
    if actual_shares is None:
        actual_shares = shares

    per_heir_info = []
    total_stat_tax = 0

    for i, m in enumerate(family):
        stat_amount = int(total_taxable * shares[i])
        stat_tax = compute_tax_for_amount(stat_amount)
        total_stat_tax += stat_tax

    for i, m in enumerate(family):
        tax_before = int(total_stat_tax * actual_shares[i])

        credits = []
        tax_after = tax_before

        if m.relation == "配偶者":
            max_spouse_exemption = max(160_000_000, int(total_taxable * shares[i]))
            spouse_credit = min(tax_before, max_spouse_exemption)
            if spouse_credit > 0 and tax_after > 0:
                tax_after = max(0, tax_after - spouse_credit)
                credits.append("配偶者控除")

        if m.is_minor:
            minor_credit = min(100_000 * (20 - m.age), tax_after)
            if minor_credit > 0:
                tax_after -= minor_credit
                credits.append("未成年控除")

        if m.is_disabled:
            rate = 200_000 if m.is_disabled == "特別" else 100_000
            disabled_credit = min(rate * (85 - m.age), tax_after)
            if disabled_credit > 0:
                tax_after -= disabled_credit
                credits.append("障害者控除")

        per_heir_info.append({
            "relation": m.relation,
            "age": m.age,
            "statutory_share": round(shares[i], 4),
            "acquired_amount": int(total_taxable * actual_shares[i]),
            "tax_before_credit": tax_before,
            "tax_after_credit": tax_after,
            "credits_applied": credits,
        })

    return {
        "total_tax": total_stat_tax,
        "per_heir": per_heir_info,
    }
