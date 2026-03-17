from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from .service import OrderService
from .schemas import OrderListResponse, OrderStatusUpdate

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get("", response_model=OrderListResponse)
def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    try:
        # 这里的 orders 现在是带有 user_email 和 address 信息的对象列表
        orders_data = OrderService.get_all_orders(db, skip=skip, limit=limit)
        total = OrderService.get_order_count(db)

        return {"status": "success", "total": total, "data": orders_data}
    except Exception as e:
        import traceback

        print(traceback.format_exc())  # 调试用
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{order_no}", response_model=dict)
def get_order_detail(order_no: str, db: Session = Depends(get_db)):
    order = OrderService.get_order_by_no(db, order_no)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": "success", "data": order}


@router.put("/{order_no}/status")
def update_order_status(
    order_no: str, payload: OrderStatusUpdate, db: Session = Depends(get_db)
):
    # 调用 Service 层的更新逻辑
    order = OrderService.update_order_status(db, order_no, payload.status)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "status": "success",
        "message": f"Order {order_no} updated to {payload.status}",
        "data": {"order_no": order.order_no, "new_status": order.status},
    }
