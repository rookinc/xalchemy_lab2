from pathlib import Path
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / ".env"

print("BASE_DIR:", BASE_DIR)
print(".env exists:", env_path.exists())
print(".env path:", env_path)

loaded = load_dotenv(env_path)
print("load_dotenv returned:", loaded)

for key in [
    "ALETHEOS_DB_HOST",
    "ALETHEOS_DB_PORT",
    "ALETHEOS_DB_USER",
    "ALETHEOS_DB_PASSWORD",
    "ALETHEOS_DB_NAME",
]:
    print(f"{key}={os.getenv(key)!r}")
