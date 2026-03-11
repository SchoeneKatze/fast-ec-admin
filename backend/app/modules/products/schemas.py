from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProductBase(BaseModel):
    title: str
    category_id: Optional[int] = None
    base_price: float
    currency_code: str = "USD"
    stock_quantity: int = 0
    sku_internal_code: Optional[str] = None
    discount_factor: float = 1.0

class ProductCreate(ProductBase):
    product_id: str
    description: Optional[str] = None
    barcode: Optional[str] = None

class ProductResponse(ProductBase):
    product_id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# 专门给列表接口用的格式，符合前端 res.data 结构
class ProductListResponse(BaseModel):
    status: str
    total: int
    data: List[ProductResponse]