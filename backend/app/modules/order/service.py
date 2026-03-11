from sqlalchemy.orm import Session
from .models import Order

class OrderService:
    @staticmethod
    def get_all_orders(db: Session, skip: int = 0, limit: int = 100):
        # 使用 joinedload 预加载 items，避免 N+1 查询问题
        return db.query(Order).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_order_count(db: Session):
        return db.query(Order).count()

    @staticmethod
    def get_order_by_no(db: Session, order_no: str):
        return db.query(Order).filter(Order.order_no == order_no).first()

    @staticmethod
    def update_order_status(db: Session, order_no: str, new_status: str):
        order = db.query(Order).filter(Order.order_no == order_no).first()
        if order:
            order.status = new_status
            db.commit()
            db.refresh(order)
        return order