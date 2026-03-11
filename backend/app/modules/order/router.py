from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from .service import OrderService
from .schemas import OrderListResponse

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.get("", response_model=OrderListResponse)
def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    try:
        orders = OrderService.get_all_orders(db, skip=skip, limit=limit)
        total = OrderService.get_order_count(db)
        
        return {
            "status": "success",
            "total": total,
            "data": orders # Pydantic 会自动帮你把 Numeric 转成 float
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{order_no}", response_model=dict)
def get_order_detail(order_no: str, db: Session = Depends(get_db)):
    order = OrderService.get_order_by_no(db, order_no)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": "success", "data": order}