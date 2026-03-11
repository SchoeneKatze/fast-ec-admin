from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_no = Column(String(50), unique=True, index=True)
    user_id = Column(String(100), nullable=False)
    total_price = Column(Numeric(10, 2), default=0.00)
    currency = Column(String(10), default="USD")
    status = Column(String(20), default="PENDING") # PENDING, PAID, SHIPPED, COMPLETED
    tracking_number = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关联订单项
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(String(50))
    product_name = Column(String(255)) # 冗余存储，防止商品改名影响历史订单
    quantity = Column(Integer, default=1)
    unit_price = Column(Numeric(10, 2))

    order = relationship("Order", back_populates="items")