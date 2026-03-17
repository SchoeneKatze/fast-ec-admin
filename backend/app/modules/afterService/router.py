from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from . import service, schemas
from typing import List, Optional

router = APIRouter(prefix="/admin/tickets", tags=["Admin Tickets"])


@router.get("", response_model=List[schemas.TicketAdminResponse])
def read_admin_tickets(
    order_no: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db),
):
    return service.get_admin_tickets(
        db, order_no, status, start_date, end_date, min_price, max_price
    )


@router.put("/{ticket_id}/status")
def update_status(
    ticket_id: int, body: schemas.StatusUpdate, db: Session = Depends(get_db)
):
    return service.update_ticket_status(db, ticket_id, body.status)
