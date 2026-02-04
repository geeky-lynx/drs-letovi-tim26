from __future__ import annotations

from flask import jsonify, request

from ..db import db
from ..db.models import Flight, Purchase, Rating
from ..utils.auth import current_user_id, require_roles
from .flights import compute_runtime_state
from . import api


def _require_int(value, name: str):
    try:
        return int(value), None
    except (TypeError, ValueError):
        return None, f"{name} must be int"


@api.post("/ratings")
@require_roles(["USER", "ADMIN", "MANAGER"])
def create_or_update_rating():
    """Create or update rating for a finished flight.

    Expected JSON/form:
      - flight_id (int)
      - rating (1..5)
      - user_id (optional; default from X-User-Id)
    """
    data = request.get_json(silent=True) if request.is_json else dict(request.form or {})

    flight_id, err = _require_int(data.get("flight_id") or data.get("flightId"), "flight_id")
    if err:
        return jsonify({"error": "VALIDATION", "message": err}), 400

    rating_val, err = _require_int(data.get("rating"), "rating")
    if err:
        return jsonify({"error": "VALIDATION", "message": err}), 400

    if rating_val < 1 or rating_val > 5:
        return jsonify({"error": "VALIDATION", "message": "rating must be between 1 and 5"}), 400

    user_id = (data.get("user_id") or data.get("userId") or current_user_id() or "").strip()
    if not user_id:
        return jsonify({"error": "VALIDATION", "message": "user_id is required (or send X-User-Id)"}), 400

    flight = Flight.query.get(flight_id)
    if flight is None:
        return jsonify({"error": "NOT_FOUND", "message": "Flight not found"}), 404

    state, _ = compute_runtime_state(flight)
    if state != "FINISHED":
        return jsonify({"error": "INVALID", "message": "Flight is not finished yet"}), 409

    # Must have purchased this flight (COMPLETED)
    purchase = Purchase.query.filter_by(user_id=user_id, flight_id=flight_id, status="COMPLETED").first()
    if purchase is None:
        return jsonify({"error": "FORBIDDEN", "message": "You can only rate flights you bought"}), 403

    existing = Rating.query.filter_by(user_id=user_id, flight_id=flight_id).first()
    if existing:
        existing.rating = rating_val
        db.session.commit()
        return jsonify(existing.to_dict()), 200

    r = Rating(user_id=user_id, flight_id=flight_id, rating=rating_val)
    db.session.add(r)
    db.session.commit()
    return jsonify(r.to_dict()), 201


@api.get("/ratings")
@require_roles(["ADMIN", "MANAGER", "USER"])
def list_ratings():
    """List ratings.

    Optional query params:
      - flight_id
      - user_id
    """
    flight_id = request.args.get("flight_id") or request.args.get("flightId")
    user_id = request.args.get("user_id") or request.args.get("userId")

    q = Rating.query
    if flight_id:
        try:
            q = q.filter(Rating.flight_id == int(flight_id))
        except ValueError:
            return jsonify({"error": "VALIDATION", "message": "flight_id must be int"}), 400
    if user_id:
        q = q.filter(Rating.user_id == user_id)

    ratings_list = q.order_by(Rating.created_at.desc()).all()
    return jsonify([r.to_dict() for r in ratings_list])
