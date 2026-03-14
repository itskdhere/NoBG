import os

ENV = os.getenv("ENV", "development")
PREFIX = "production" if ENV == "production" else "dev"

model_name = "u2net"
