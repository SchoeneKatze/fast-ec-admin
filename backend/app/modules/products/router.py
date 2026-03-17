from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from .service import ProductService
from .schemas import ProductCreate, ProductUpdate, ProductOut, PricePreviewRequest

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("")
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    product_id: Optional[str] = Query(None),
    date_start: Optional[str] = Query(None),
    date_end: Optional[str] = Query(None),
    price_min: Optional[float] = Query(None),
    price_max: Optional[float] = Query(None),
    stock_status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    try:
        total, data = ProductService.get_products_paged(
            db,
            skip,
            limit,
            product_id=product_id,
            date_start=date_start,
            date_end=date_end,
            price_min=price_min,
            price_max=price_max,
            stock_status=stock_status,
        )
        return {"status": "success", "total": total, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{product_id}")
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = ProductService.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "success", "data": product}


@router.post("", response_model=ProductOut)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    if ProductService.get_product_by_id(db, product_in.product_id):
        raise HTTPException(status_code=400, detail="Product ID already exists")
    return ProductService.create_product(db, product_in)


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: str, product_in: ProductUpdate, db: Session = Depends(get_db)
):
    db_obj = ProductService.get_product_by_id(db, product_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return ProductService.update_product(db, db_obj, product_in)


@router.delete("/{product_id}")
def delete_product(product_id: str, db: Session = Depends(get_db)):
    if not ProductService.delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="Not found")
    return {"status": "success", "message": "Product deleted"}


@router.post("/calculate-preview")
async def api_calculate_preview(
    data: PricePreviewRequest, db: Session = Depends(get_db)
):
    return ProductService.calculate_preview(
        db=db,
        base_price=data.base_price,
        discount_factor=data.discount_factor,
        tax_class=data.tax_class,
        currency_code=data.currency_code,
    )
