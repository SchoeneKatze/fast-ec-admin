from typing import Optional

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from . import models, schemas
from app.modules.order.models import Order, OrderItem # 引用订单模块的模型

def get_admin_tickets(
    db: Session, 
    order_no: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    # 基础查询
    query = db.query(models.SupportTicket)

    # 1. 筛选订单号
    if order_no:
        query = query.filter(models.SupportTicket.order_id.contains(order_no))

    # 2. 筛选工单状态
    if status:
        query = query.filter(models.SupportTicket.status == status)

    # 3. 筛选日期
    if start_date:
        query = query.filter(models.SupportTicket.created_at >= start_date)
    if end_date:
        query = query.filter(models.SupportTicket.created_at <= end_date)

    tickets = query.order_by(models.SupportTicket.created_at.desc()).all()

    # 组装数据，由于 order_id 存的是 order_no，我们需要二次查询订单详情
    results = []
    for t in tickets:
        order = db.query(Order).filter(Order.order_no == t.order_id).first()
        order_data = None
        if order:
            # 这里的 price 筛选发生在逻辑层（如果需要 SQL 层筛选需写 Join）
            if min_price and order.total_price < min_price: continue
            if max_price and order.total_price > max_price: continue
            
            items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
            order_data = {
                "total_price": float(order.total_price),
                "currency": order.currency,
                "status": order.status,
                "items": [{"product_name": i.product_name, "quantity": i.quantity, "unit_price": float(i.unit_price)} for i in items]
            }
        
        t_dict = schemas.TicketAdminResponse.from_orm(t).dict()
        t_dict["order_info"] = order_data
        results.append(t_dict)
        
    return results

def update_ticket_status(db: Session, ticket_id: int, status: str):
    db_obj = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if db_obj:
        db_obj.status = status
        db.commit()
        db.refresh(db_obj)
    return db_obj