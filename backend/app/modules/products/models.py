from sqlalchemy import Column, String, Integer, Numeric, Text, TIMESTAMP, func, Enum, Float, Boolean
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    product_id = Column(String(50), primary_key=True)
    category_id = Column(Integer, index=True)
    brand_id = Column(Integer)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    base_price = Column(Numeric(12, 2), nullable=False)
    currency_code = Column(String(3), default='USD')
    tax_class = Column(Enum('Standard', 'Reduced', 'Zero'), default='Standard')
    stock_quantity = Column(Integer, default=0)
    sku_internal_code = Column(String(100), unique=True)
    barcode = Column(String(100))
    origin_country = Column(String(50))
    weight = Column(Float)
    dimensions = Column(String(100))
    created_at = Column(TIMESTAMP, server_default=func.now())
    isActive = Column(Boolean, default=True)
    discount_factor = Column(Numeric(3, 2), default=1.00)

class Currency(Base):
    __tablename__ = "currencies"
    currency_code = Column(String(3), primary_key=True)
    currency_symbol = Column(String(5), nullable=False)
    exchange_rate = Column(Numeric(12, 4), nullable=False)
    is_default = Column(Boolean, default=False)

class TaxSetting(Base):
    __tablename__ = "tax_settings"
    id = Column(Integer, primary_key=True)
    country_code = Column(String(2), index=True) # 如 'US', 'CN'
    tax_class = Column(Enum('Standard', 'Reduced', 'Zero'))
    tax_rate = Column(Numeric(5, 4), nullable=False) # 如 0.1300
    is_show_inclusive = Column(Boolean, default=False)