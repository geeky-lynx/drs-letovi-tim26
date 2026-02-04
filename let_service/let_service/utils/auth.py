from __future__ import annotations

from functools import wraps
from typing import Callable, Iterable

from flask import current_app, request, jsonify


def current_user_id() -> str | None:
    return request.headers.get("X-User-Id") or request.headers.get("x-user-id")


def current_user_role() -> str | None:
    role = request.headers.get("X-User-Role") or request.headers.get("x-user-role")
    return role.upper() if role else None


def require_roles(allowed: Iterable[str]) -> Callable:
    """Optionally enforce roles via Config.ENFORCE_ROLES.

    If LET_ENFORCE_ROLES=false (default), the decorator won't block requests.
    This is useful while integrating, when auth is handled by Server service.
    """

    allowed_up = {r.upper() for r in allowed}

    def deco(fn: Callable) -> Callable:
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not current_app.config.get("ENFORCE_ROLES", False):
                return fn(*args, **kwargs)
            role = current_user_role()
            if role is None or role not in allowed_up:
                return jsonify({"error": "FORBIDDEN", "message": "Insufficient role"}), 403
            return fn(*args, **kwargs)

        return wrapper

    return deco
