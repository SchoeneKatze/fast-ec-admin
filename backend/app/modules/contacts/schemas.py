from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class OrderItemSchema(BaseModel):
    product_name: str
    quantity: int
    unit_price: float


class OrderInfoSchema(BaseModel):
    total_price: float
    currency: str
    status: str
    items: List[OrderItemSchema]


class TicketAdminResponse(BaseModel):
    id: int
    ticket_type: str
    order_id: str
    user_id: str
    reason: str
    details: str
    status: str
    created_at: datetime
    order_info: Optional[OrderInfoSchema] = None

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str
