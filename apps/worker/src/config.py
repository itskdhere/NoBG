import os
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = os.getenv("MODEL_NAME", "u2net")

ENV = os.getenv("ENV", "development")
PREFIX = "production" if ENV == "production" else "dev"
