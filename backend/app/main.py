from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from app.modules.users.router import router as user_router
from app.modules.products.router import router as products_router
from app.modules.order.router import router as order_router
from app.modules.contacts.router import router as contacts_router

app = FastAPI(title="Fast-EC Admin API")

origins = [
    os.getenv("FRONT_URL_LOCAL"),
    os.getenv("FRONT_URL"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(products_router)
app.include_router(order_router)
app.include_router(contacts_router)

@app.get("/")
def read_root():
    return {"status": "Admin API is running on port 8001"}