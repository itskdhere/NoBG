import os

MODEL_NAME = os.getenv("MODEL_NAME", "u2net")

ENV = os.getenv("ENV", "development")
PREFIX = "production" if ENV == "production" else "dev"
