from sqlalchemy.orm import Session, joinedload
from .models import Order
from app.modules.users.models import User
from .schemas import OrderResponse


class OrderService:
    @staticmethod
    def get_all_orders(db: Session, skip: int = 0, limit: int = 100):
        # 1. 预加载关联数据
        orders = (
            db.query(Order)
            .options(joinedload(Order.items), joinedload(Order.address))
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        results = []
        for o in orders:
            # 2. 获取 Email
            user_obj = db.query(User).filter(User.logto_id == o.user_id).first()
            user_email = user_obj.email if user_obj else o.user_id

            # 3. 处理地址字典
            formatted_address = None
            if o.address:
                addr = o.address
                formatted_address = {
                    "tag": addr.tag,
                    "recipient_name": addr.recipient_name,
                    "phone": addr.phone,
                    "full_address": f"{addr.address_line}, {addr.city}, {addr.country_code}",
                }

            # 4. 构造完整字典，手动适配 Schema
            full_data = {
                "id": o.id,
                "order_no": o.order_no,
                "user_id": o.user_id,
                "user_email": user_email,
                "currency": o.currency,
                "total_price": float(o.total_price),
                "status": o.status,
                "tracking_number": o.tracking_number,
                "created_at": o.created_at,
                "items": [
                    {
                        "product_name": item.product_name,
                        "quantity": item.quantity,
                        "unit_price": float(item.unit_price),
                    }
                    for item in o.items
                ],
                "address": formatted_address,
            }

            # 使用 model_validate 确保数据符合 OrderResponse 定义
            results.append(OrderResponse.model_validate(full_data))

        return results

    # --- 这里是刚才报错缺失的方法 ---
    @staticmethod
    def get_order_count(db: Session):
        return db.query(Order).count()

    @staticmethod
    def get_order_by_no(db: Session, order_no: str):
        return db.query(Order).filter(Order.order_no == order_no).first()

    @staticmethod
    def update_order_status(db: Session, order_no: str, new_status: str):
        # 1. 查找订单
        order = db.query(Order).filter(Order.order_no == order_no).first()

        if order:
            # 2. 更新状态
            order.status = new_status
            try:
                db.commit()  # 提交事务
                db.refresh(order)  # 刷新数据
                return order
            except Exception as e:
                db.rollback()  # 出错则回滚
                raise e
        return None
