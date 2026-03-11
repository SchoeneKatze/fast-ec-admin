from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class OrderItemSchema(BaseModel):
    product_name: str
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_no: str
    user_id: str
    currency: str
    total_price: float
    status: str
    tracking_number: Optional[str] = None
    created_at: datetime
    items: List[OrderItemSchema] = []

    class Config:
        from_attributes = True

class OrderListResponse(BaseModel):
    status: str
    total: int
    data: List[OrderResponse]