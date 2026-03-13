from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class ProductBase(BaseModel):
    title: str
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    description: Optional[str] = None
    base_price: Decimal
    currency_code: str = "USD"
    tax_class: str = "Standard"
    stock_quantity: int = 0
    sku_internal_code: Optional[str] = None
    barcode: Optional[str] = None
    origin_country: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[str] = None
    isActive: bool = True
    discount_factor: Decimal = Field(default=Decimal("1.00"))

class ProductCreate(ProductBase):
    product_id: str
    description: Optional[str] = None
    barcode: Optional[str] = None

class ProductResponse(ProductBase):
    product_id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    status: str
    total: int
    data: List[ProductResponse]

class ProductUpdate(BaseModel):
    # 所有字段均为可选，方便局部更新
    title: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[Decimal] = None
    tax_class: Optional[str] = None
    stock_quantity: Optional[int] = None
    sku_internal_code: Optional[str] = None
    barcode: Optional[str] = None
    discount_factor: Optional[Decimal] = None
    isActive: Optional[bool] = None

class ProductOut(ProductBase):
    product_id: str
    created_at: datetime
    class Config:
        from_attributes = True
        
class PricePreviewRequest(BaseModel):
    # Field 里的描述可选，但建议加上，方便自动生成文档
    base_price: float = Field(..., description="商品基础价格")
    discount_factor: float = Field(default=1.0, description="折扣因子 (0.0-1.0)")
    tax_class: str = Field(..., description="税收类别: Standard, Reduced, Zero")
    currency_code: str = Field(..., description="目标货币代码，如 USD, CNY")

    class Config:
        # 允许从 ORM 模型中直接读取（如果以后需要的话）
        from_attributes = True
        # 示例数据，会显示在 Swagger (/docs) 文档里
        json_schema_extra = {
            "example": {
                "base_price": 100.0,
                "discount_factor": 0.9,
                "tax_class": "Standard",
                "currency_code": "USD"
            }
        }