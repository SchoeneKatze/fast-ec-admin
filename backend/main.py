from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Fast-EC Admin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Admin 前端的默认地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Admin API is running on port 8001"}