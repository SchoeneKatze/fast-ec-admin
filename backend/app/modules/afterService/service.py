from typing import Optional

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from . import models, schemas
from app.modules.order.models import Order, OrderItem
from app.modules.users.models import User


def get_admin_tickets(
    db: Session,
    order_no: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
):
    # 1. 基础工单查询逻辑 (注意：此处 query 应该复用上面的筛选条件，不要重新 db.query.all())
    query = db.query(models.SupportTicket)

    if order_no:
        query = query.filter(models.SupportTicket.order_id.contains(order_no))
    if status:
        query = query.filter(models.SupportTicket.status == status)
    if start_date:
        query = query.filter(models.SupportTicket.created_at >= start_date)
    if end_date:
        query = query.filter(models.SupportTicket.created_at <= end_date)

    tickets = query.order_by(models.SupportTicket.created_at.desc()).all()

    results = []
    for t in tickets:
        order = t.order
        order_data = None
        
        target_user_id = order.user_id if order else t.user_id
        user_obj = db.query(User).filter(User.logto_id == target_user_id).first()
        user_display_email = user_obj.email if user_obj else target_user_id

        if order:
            # 价格过滤 (逻辑层过滤)
            if min_price and float(order.total_price) < min_price:
                continue
            if max_price and float(order.total_price) > max_price:
                continue

            # 获取关联的地址对象 (这就是你在 Order 模型里定义的 address 关系)
            addr = order.address

            # 组装地址字典
            address_dict = {
                "recipient_name": addr.recipient_name if addr else "N/A",
                "phone": addr.phone if addr else "N/A",
                "full_address": f"{addr.address_line}, {addr.city}  ({addr.country_code})" if addr else "N/A",
                "tag": addr.tag if addr else "N/A",
            }

            order_data = {
                "total_price": float(order.total_price),
                "currency": order.currency,
                "status": order.status,
                "items": [
                    {
                        "product_name": i.product_name,
                        "quantity": i.quantity,
                        "unit_price": float(i.unit_price),
                    }
                    for i in order.items
                ],
                "address": address_dict,
            }

        t_dict = schemas.TicketAdminResponse.from_orm(t).model_dump()
        t_dict["order_info"] = order_data
        t_dict["user_email"] = user_display_email

        results.append(t_dict)

    return results


def update_ticket_status(db: Session, ticket_id: int, status: str):
    db_obj = (
        db.query(models.SupportTicket)
        .filter(models.SupportTicket.id == ticket_id)
        .first()
    )
    if db_obj:
        db_obj.status = status
        db.commit()
        db.refresh(db_obj)
    return db_obj
