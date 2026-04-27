from __future__ import annotations

import json
import os
from typing import Any

import mysql.connector
from fastapi import HTTPException
from mysql.connector import Error as MySQLError


def get_required_env(name: str) -> str:
    value = os.getenv(name)
    if value is None:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def get_db_connection():
    return mysql.connector.connect(
        host=get_required_env("ALETHEOS_DB_HOST"),
        port=int(get_required_env("ALETHEOS_DB_PORT")),
        user=get_required_env("ALETHEOS_DB_USER"),
        password=os.getenv("ALETHEOS_DB_PASSWORD", ""),
        database=get_required_env("ALETHEOS_DB_NAME"),
    )


def normalize_row(row: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(row)

    for key, value in list(normalized.items()):
        if isinstance(value, (bytes, bytearray)):
            normalized[key] = value.decode("utf-8")
        elif key in {
            "action_payload",
            "body_json",
            "params_json",
            "payload_json",
            "style_json",
            "constraints_json",
        } and isinstance(value, str):
            try:
                normalized[key] = json.loads(value)
            except json.JSONDecodeError:
                pass

    return normalized


def fetch_all(query: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute(query, params)
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [normalize_row(row) for row in rows]
    except MySQLError as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}") from exc
