import json
import os
from datetime import datetime
from decimal import Decimal, ROUND_DOWN, ROUND_HALF_UP
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, func
from .models import Product, Currency, TaxSetting
from .schemas import ProductCreate, ProductUpdate

# --- JSON 加载逻辑 ---
current_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(current_dir, "currencies_round.json")

with open(json_path, "r", encoding="utf-8") as f:
    CURRENCY_CONFIG = json.load(f)

COUNTRY_MAP = {
    c_code: curr_code
    for curr_code, info in CURRENCY_CONFIG.items()
    for c_code in info.get("country_code", [])
}


class ProductService:
    @staticmethod
    def generate_product_code(db: Session):
        today_str = datetime.now().strftime("%Y%m%d")
        count = (
            db.query(Product).filter(Product.product_id.like(f"{today_str}%")).count()
        )
        new_serial = str(count + 1).zfill(5)
        return f"{today_str}{new_serial}"

    @staticmethod
    def get_products_paged(
        db: Session,
        skip: int,
        limit: int,
        product_id: str = None,
        date_start: str = None,
        date_end: str = None,
        price_min: float = None,
        price_max: float = None,
        stock_status: str = None,
    ):
        query = db.query(Product)

        # 1. 筛选：ID 模糊搜索
        if product_id:
            query = query.filter(Product.product_id.ilike(f"%{product_id}%"))

        # 2. 筛选：日期范围
        if date_start:
            query = query.filter(Product.created_at >= date_start)
        if date_end:
            query = query.filter(Product.created_at <= f"{date_end} 23:59:59")

        # 3. 筛选：价格区间
        if price_min is not None:
            query = query.filter(Product.base_price >= price_min)
        if price_max is not None:
            query = query.filter(Product.base_price <= price_max)

        # 4. 筛选：库存状态 (按你要求：仅区分有货/无货)
        if stock_status == "OutOfStock":
            query = query.filter(Product.stock_quantity <= 0)
        elif stock_status == "InStock":
            query = query.filter(Product.stock_quantity > 0)

        total = query.count()
        # 按创建时间倒序排，最新的在前面
        data = query.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()
        return total, data

    @staticmethod
    def calculate_preview(
        db: Session,
        base_price: float,
        discount_factor: float,
        tax_class: str,
        currency_code: str,
    ):
        matched_countries = [k for k, v in COUNTRY_MAP.items() if v == currency_code]
        effective_country = matched_countries[0] if matched_countries else "US"
        conf = CURRENCY_CONFIG.get(currency_code, CURRENCY_CONFIG["USD"])

        local_base_price = Decimal(str(base_price))

        tax_stmt = select(TaxSetting.tax_rate).where(
            and_(
                TaxSetting.tax_class == tax_class,
                TaxSetting.country_code == effective_country,
            )
        )
        db_tax_rate = db.execute(tax_stmt).scalar()
        tax_rate = (
            Decimal(str(db_tax_rate)) if db_tax_rate is not None else Decimal("0")
        )

        # 计算逻辑
        raw_final = (
            local_base_price
            * Decimal(str(discount_factor))
            * (Decimal("1.0") + tax_rate)
        )

        # 舍入逻辑
        rounding_style = (
            ROUND_DOWN if conf["rounding_mode"] == "DOWN" else ROUND_HALF_UP
        )
        prec = (
            Decimal("1")
            if conf["decimal_places"] == 0
            else Decimal("0." + "0" * conf["decimal_places"])
        )

        final_price = float(raw_final.quantize(prec, rounding=rounding_style))

        return {
            "final_price": final_price,
            "symbol": conf["symbol"],
            "debug_info": {"country": effective_country, "tax_rate": float(tax_rate)},
        }

    @staticmethod
    def get_product_by_id(db: Session, product_id: str):
        return db.query(Product).filter(Product.product_id == product_id).first()

    @staticmethod
    def create_product(db: Session, obj_in: ProductCreate):
        product_data = obj_in.dict()
        if not product_data.get("product_id") or "PRD-" in product_data.get(
            "product_id"
        ):
            product_data["product_id"] = ProductService.generate_product_code(db)
        db_obj = Product(**product_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def update_product(db: Session, db_obj: Product, obj_in: ProductUpdate):
        update_data = obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def delete_product(db: Session, product_id: str):
        db_obj = db.query(Product).filter(Product.product_id == product_id).first()
        if db_obj:
            db.delete(db_obj)
            db.commit()
            return True
        return False
