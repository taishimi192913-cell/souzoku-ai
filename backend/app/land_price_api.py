from typing import Optional
from app.config import LAND_PRICE_API_KEY


class LandPriceAPI:
    def __init__(self):
        self.api_key = LAND_PRICE_API_KEY

    def is_available(self) -> bool:
        return bool(self.api_key)

    async def get_route_price(self, prefecture: str, city: str, address: str) -> Optional[int]:
        if not self.is_available():
            return None
        return None


_api = None


def get_land_price_api() -> LandPriceAPI:
    global _api
    if _api is None:
        _api = LandPriceAPI()
    return _api
