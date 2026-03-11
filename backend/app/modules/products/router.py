from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from .service import ProductService

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("")
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    try:
        # 只需要调用 Service 的一个方法
        total, data = ProductService.get_products_paged(db, skip, limit)
        
        return {
            "status": "success",
            "total": total,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Service Error: {str(e)}")

@router.get("/{product_id}")
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = ProductService.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "success", "data": product}