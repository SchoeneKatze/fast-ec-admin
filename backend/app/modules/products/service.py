from sqlalchemy.orm import Session
from .models import Product

class ProductService:
    @staticmethod
    def get_products_paged(db: Session, skip: int, limit: int):
        # 1. 数据库查询
        products = db.query(Product).offset(skip).limit(limit).all()
        total = db.query(Product).count()
        
        # 2. 逻辑加工：在这里处理复杂的类型转换或数据清洗
        # 这样 Router 拿到的就是干净的、可以直接发给前端的数据列表
        processed_data = [
            {
                "product_id": p.product_id,
                "title": p.title,
                "category_id": p.category_id,
                "base_price": float(p.base_price) if p.base_price else 0,
                "stock_quantity": p.stock_quantity,
                "sku_internal_code": p.sku_internal_code,
                "discount_factor": float(p.discount_factor) if p.discount_factor else 1.0,
            }
            for p in products
        ]
        
        return total, processed_data

    @staticmethod
    def get_product_by_id(db: Session, product_id: str):
        # 如果有复杂的详情关联查询，也写在这里
        return db.query(Product).filter(Product.product_id == product_id).first()