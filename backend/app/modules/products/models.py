from sqlalchemy import Column, String, Integer, Numeric, DateTime, Text
from app.core.database import Base
from datetime import datetime

class Product(Base):
    __tablename__ = "products"

    product_id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    category_id = Column(Integer)
    base_price = Column(Numeric(10, 2), default=0.00)
    currency_code = Column(String(10), default="USD")
    stock_quantity = Column(Integer, default=0)
    sku_internal_code = Column(String(100), unique=True)
    barcode = Column(String(100))
    discount_factor = Column(Numeric(3, 2), default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)