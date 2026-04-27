from pathlib import Path
import os
from dotenv import load_dotenv
import mysql.connector

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

config = {
    "host": os.getenv("ALETHEOS_DB_HOST"),
    "port": int(os.getenv("ALETHEOS_DB_PORT", "3306")),
    "user": os.getenv("ALETHEOS_DB_USER"),
    "password": os.getenv("ALETHEOS_DB_PASSWORD"),
    "database": os.getenv("ALETHEOS_DB_NAME"),
}

print("CONFIG:", {k: ("***" if k == "password" else v) for k, v in config.items()})

conn = mysql.connector.connect(**config)
cur = conn.cursor()
cur.execute("SHOW TABLES")
print("TABLES:")
for (name,) in cur.fetchall():
    print(name)

cur.execute("SELECT COUNT(*) FROM graphs")
print("graphs count:", cur.fetchone()[0])

cur.close()
conn.close()
print("DB OK")
