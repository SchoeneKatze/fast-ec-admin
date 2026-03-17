from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class SupportTicket(Base):
    __tablename__ = "support_tickets"
    id = Column(Integer, primary_key=True, index=True)
    ticket_type = Column(String(20))  # REFUND or CONTACT
    order_id = Column(String(50), ForeignKey("orders.order_no"))
    user_id = Column(String(50))
    reason = Column(String(200))
    details = Column(Text)
    status = Column(String(20), default="PENDING")  # PENDING, FINISHED, DENIED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    order = relationship("Order", backref="tickets")
