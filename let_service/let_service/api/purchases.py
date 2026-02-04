from __future__ import annotations

import os
import time
from threading import Thread
from typing import Any, Dict, Optional, Tuple

from flask import current_app, jsonify, request

from let_service.db import db
from let_service.db.models import Flight, Purchase
from let_service.api import api



def _get_processing_seconds() -> int:
    raw = os.getenv("LET_PURCHASE_PROCESSING_SECONDS", "2")
    try:
        value = int(str(raw).strip())
    except ValueError:
        value = 2
    if value < 0:
        value = 0
    return value


def _get_user_headers() -> Tuple[Optional[int], str]:
    user_id_raw = request.headers.get("X-User-Id")
    role = (request.headers.get("X-User-Role") or "").strip().upper()

    user_id: Optional[int] = None
    if user_id_raw is not None and str(user_id_raw).strip() != "":
        try:
            user_id = int(str(user_id_raw).strip())
        except ValueError:
            user_id = None

    return user_id, role


def _process_purchase(app, purchase_id: int) -> None:
 
    processing_seconds = _get_processing_seconds()

    with app.app_context():
        # simulate slow processing
        time.sleep(processing_seconds)

        purchase = Purchase.query.get(purchase_id)
        if purchase is None:
            return

        flight = Flight.query.get(purchase.flight_id)
        if flight is None:
            purchase.status = "FAILED"
            purchase.failure_reason = "Flight not found"
            db.session.commit()
            return

        # Must be approved, not canceled, and not started yet
        if getattr(flight, "approval_status", None) != "APPROVED":
            purchase.status = "FAILED"
            purchase.failure_reason = "Flight is not approved"
            db.session.commit()
            return

        if getattr(flight, "canceled", False):
            purchase.status = "FAILED"
            purchase.failure_reason = "Flight is canceled"
            db.session.commit()
            return

        # runtime status should be UPCOMING for purchase to be allowed
        if hasattr(flight, "compute_runtime_status"):
            runtime_status = flight.compute_runtime_status()
        else:
            # fallback: if method doesn't exist, allow purchase only if not clearly started.
            runtime_status = "UPCOMING"

        if runtime_status != "UPCOMING":
            purchase.status = "FAILED"
            purchase.failure_reason = "Flight already started or finished"
            db.session.commit()
            return

        purchase.status = "COMPLETED"
        purchase.failure_reason = None
        db.session.commit()


@api.route("/purchases", methods=["POST"])
def create_purchase():
    """
    Start async purchase processing.
    Returns immediately with purchase in PENDING state (202 Accepted).
    """
    payload: Dict[str, Any]
    if request.is_json:
        payload = request.get_json(silent=True) or {}
    else:
        # allow form-data too
        payload = dict(request.form or {})

    flight_id_raw = payload.get("flight_id")
    if flight_id_raw is None or str(flight_id_raw).strip() == "":
        return jsonify({"error": "VALIDATION", "message": "flight_id is required"}), 400

    try:
        flight_id = int(str(flight_id_raw).strip())
    except ValueError:
        return jsonify({"error": "VALIDATION", "message": "flight_id must be an integer"}), 400

    user_id, _role = _get_user_headers()
    if user_id is None:
        return jsonify({"error": "AUTH", "message": "X-User-Id header is required"}), 401

    flight = Flight.query.get(flight_id)
    if flight is None:
        return jsonify({"error": "NOT_FOUND", "message": "Flight not found"}), 404

    purchase = Purchase(
        user_id=user_id,
        flight_id=flight_id,
        price_paid=float(getattr(flight, "price", 0.0)),
        status="PENDING",
        failure_reason=None,
    )
    db.session.add(purchase)
    db.session.commit()

    app = current_app._get_current_object()
    Thread(target=_process_purchase, args=(app, purchase.id), daemon=True).start()

    return jsonify(
        {
            "purchase_id": purchase.id,
            "flight_id": purchase.flight_id,
            "user_id": purchase.user_id,
            "status": purchase.status,
            "processing_seconds": _get_processing_seconds(),
        }
    ), 202


@api.route("/users/<int:user_id>/purchases", methods=["GET"])
def get_user_purchases(user_id: int):
    purchases = (
        Purchase.query.filter_by(user_id=user_id)
        .order_by(Purchase.created_at.desc())
        .all()
    )

    if purchases and hasattr(purchases[0], "to_dict"):
        return jsonify([p.to_dict() for p in purchases]), 200

    out = []
    for p in purchases:
        out.append(
            {
                "id": getattr(p, "id", None),
                "user_id": getattr(p, "user_id", None),
                "flight_id": getattr(p, "flight_id", None),
                "price_paid": getattr(p, "price_paid", None),
                "status": getattr(p, "status", None),
                "failure_reason": getattr(p, "failure_reason", None),
                "created_at": str(getattr(p, "created_at", "")) if getattr(p, "created_at", None) else None,
            }
        )
    return jsonify(out), 200
