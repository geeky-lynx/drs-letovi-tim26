from __future__ import annotations

from datetime import datetime
from typing import Any

from flask import Request


def get_json_or_form(request: Request) -> dict[str, Any]:
    """Accept JSON or form-data payloads."""
    if request.is_json:
        data = request.get_json(silent=True) or {}
        if isinstance(data, dict):
            return data
        return {}
    return dict(request.form) if request.form else {}


def parse_iso_datetime(value: str) -> datetime:
    # Accept ISO 8601, also allow 'YYYY-MM-DD HH:MM:SS'
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return datetime.fromisoformat(value.replace(' ', 'T'))
