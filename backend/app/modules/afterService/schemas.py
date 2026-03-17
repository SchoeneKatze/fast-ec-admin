from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class OrderItemSchema(BaseModel):
    product_name: str
    quantity: int
    unit_price: float


class AddressInfoSchema(BaseModel):
    tag: str
    recipient_name: str
    phone: str
    address_line: str
    city: Optional[str]
    state: Optional[str]
    country_code: str

    class Config:
        from_attributes = True
        
class OrderInfoSchema(BaseModel):
    total_price: float
    currency: str
    status: str
    items: List[OrderItemSchema]
    address: Optional[AddressInfoSchema]


class TicketAdminResponse(BaseModel):
    id: int
    ticket_type: str
    order_id: str
    user_id: str
    reason: str
    details: str
    status: str
    created_at: datetime
    order_info: Optional[dict] = None
    user_email: Optional[str] = None

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str
