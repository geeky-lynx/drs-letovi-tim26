from __future__ import annotations

from datetime import datetime, timedelta

from flask import jsonify, request

from ..db import db
from ..db.models import Airline, Flight, Purchase
from ..utils.auth import current_user_id, require_roles
from ..utils.http import get_json_or_form, parse_iso_datetime
from . import api


def utcnow() -> datetime:
    return datetime.utcnow()


def flight_end_time(f: Flight) -> datetime:
    return f.departure_time + timedelta(seconds=int(f.duration_seconds))


def compute_runtime_state(f: Flight) -> tuple[str, int | None]:
    """Return (runtime_status, remaining_seconds).

    runtime_status is one of: UPCOMING, IN_PROGRESS, FINISHED, CANCELED.
    """
    if f.canceled:
        return "CANCELED", None
    now = utcnow()
    if now < f.departure_time:
        return "UPCOMING", int((f.departure_time - now).total_seconds())
    end = flight_end_time(f)
    if now < end:
        return "IN_PROGRESS", int((end - now).total_seconds())
    return "FINISHED", 0


def flight_response(f: Flight) -> dict:
    data = f.to_dict_base()
    state, remaining = compute_runtime_state(f)
    data["runtime_status"] = state
    data["remaining_seconds"] = remaining
    data["end_time"] = flight_end_time(f).isoformat()
    return data


def _match_query(f: Flight, q: str) -> bool:
    if not q:
        return True
    hay = " ".join(
        [
            f.name or "",
            f.origin_airport or "",
            f.destination_airport or "",
            (f.airline.name if f.airline else "") or "",
        ]
    ).lower()
    return q in hay


def _validate_required(data: dict, fields: list[str]):
    missing = [k for k in fields if (data.get(k) is None or str(data.get(k)).strip() == "")]
    if missing:
        return False, missing
    return True, []


@api.get("/flights")
def list_flights():
    """List flights by tab.

    Query params:
      - tab: upcoming | in_progress | archive | all | pending
      - q: free text
      - airline_id / airlineId
      - approval_status: PENDING|APPROVED|REJECTED
    """
    tab = (request.args.get("tab") or "upcoming").lower()
    q = (request.args.get("q") or request.args.get("query") or "").strip().lower()
    airline_id = request.args.get("airline_id") or request.args.get("airlineId")
    approval = (request.args.get("approval_status") or "").strip().upper()

    query = Flight.query
    if airline_id:
        try:
            query = query.filter(Flight.airline_id == int(airline_id))
        except ValueError:
            return jsonify({"error": "VALIDATION", "message": "airline_id must be int"}), 400

    if approval:
        query = query.filter(Flight.approval_status == approval)

    flights = query.order_by(Flight.departure_time.asc()).all()

    out: list[dict] = []
    for f in flights:
        if not _match_query(f, q):
            continue
        state, _ = compute_runtime_state(f)

        if tab == "upcoming":
            if f.approval_status != "APPROVED" or state != "UPCOMING":
                continue
        elif tab == "in_progress":
            if f.approval_status != "APPROVED" or state != "IN_PROGRESS":
                continue
        elif tab in ("archive", "archived"):
            if state not in ("FINISHED", "CANCELED"):
                continue
        elif tab == "pending":
            if f.approval_status != "PENDING":
                continue
        elif tab == "all":
            pass
        else:
            return jsonify({"error": "VALIDATION", "message": "unknown tab"}), 400

        out.append(flight_response(f))

    return jsonify(out)


@api.post("/flights")
@require_roles(["MANAGER"])
def create_flight():
    data = get_json_or_form(request)
    ok, missing = _validate_required(
        data,
        [
            "name",
            "airline_id",
            "distance_km",
            "duration_seconds",
            "departure_time",
            "origin_airport",
            "destination_airport",
            "price",
        ],
    )
    if not ok:
        return jsonify({"error": "VALIDATION", "message": f"Missing: {', '.join(missing)}"}), 400

    try:
        airline_id = int(data.get("airline_id"))
    except ValueError:
        return jsonify({"error": "VALIDATION", "message": "airline_id must be int"}), 400

    airline = Airline.query.get(airline_id)
    if not airline:
        return jsonify({"error": "NOT_FOUND", "message": "Airline not found"}), 404

    try:
        departure_time = parse_iso_datetime(str(data.get("departure_time")))
    except Exception:
        return jsonify({"error": "VALIDATION", "message": "departure_time must be ISO datetime"}), 400

    creator = current_user_id() or str(data.get("created_by_user_id") or "")
    if not creator:
        return jsonify({"error": "VALIDATION", "message": "created_by_user_id required (or send X-User-Id header)"}), 400

    flight = Flight(
        name=str(data.get("name")).strip(),
        airline_id=airline_id,
        distance_km=float(data.get("distance_km")),
        duration_seconds=int(float(data.get("duration_seconds"))),
        departure_time=departure_time,
        origin_airport=str(data.get("origin_airport")).strip(),
        destination_airport=str(data.get("destination_airport")).strip(),
        created_by_user_id=creator,
        price=float(data.get("price")),
        approval_status="PENDING",
        rejection_reason=None,
    )

    db.session.add(flight)
    db.session.commit()
    return jsonify(flight_response(flight)), 201


@api.put("/flights/<int:flight_id>")
@require_roles(["MANAGER", "ADMIN"])
def update_flight(flight_id: int):
    flight = Flight.query.get(flight_id)
    if not flight:
        return jsonify({"error": "NOT_FOUND", "message": "Flight not found"}), 404

    data = get_json_or_form(request)

    # Don't allow editing after start (safe default)
    state, _ = compute_runtime_state(flight)
    if state in ("IN_PROGRESS", "FINISHED"):
        return jsonify({"error": "VALIDATION", "message": "Cannot edit flight that started/finished"}), 400

    # If it was rejected, manager can update and it goes back to PENDING
    if flight.approval_status == "REJECTED":
        flight.approval_status = "PENDING"
        flight.rejection_reason = None
        flight.approved_by_user_id = None
        flight.approved_at = None

    if "name" in data:
        flight.name = str(data.get("name") or "").strip() or flight.name
    if "airline_id" in data:
        try:
            aid = int(data.get("airline_id"))
        except ValueError:
            return jsonify({"error": "VALIDATION", "message": "airline_id must be int"}), 400
        airline = Airline.query.get(aid)
        if not airline:
            return jsonify({"error": "NOT_FOUND", "message": "Airline not found"}), 404
        flight.airline_id = aid
    if "distance_km" in data:
        flight.distance_km = float(data.get("distance_km"))
    if "duration_seconds" in data:
        flight.duration_seconds = int(float(data.get("duration_seconds")))
    if "departure_time" in data:
        try:
            flight.departure_time = parse_iso_datetime(str(data.get("departure_time")))
        except Exception:
            return jsonify({"error": "VALIDATION", "message": "departure_time must be ISO datetime"}), 400
    if "origin_airport" in data:
        flight.origin_airport = str(data.get("origin_airport") or "").strip() or flight.origin_airport
    if "destination_airport" in data:
        flight.destination_airport = str(data.get("destination_airport") or "").strip() or flight.destination_airport
    if "price" in data:
        flight.price = float(data.get("price"))

    db.session.commit()
    return jsonify(flight_response(flight))


@api.delete("/flights/<int:flight_id>")
@require_roles(["ADMIN"])
def delete_flight(flight_id: int):
    flight = Flight.query.get(flight_id)
    if not flight:
        return jsonify({"error": "NOT_FOUND", "message": "Flight not found"}), 404
    db.session.delete(flight)
    db.session.commit()
    return jsonify({"ok": True})


@api.post("/flights/<int:flight_id>/approve")
@require_roles(["ADMIN"])
def approve_flight(flight_id: int):
    flight = Flight.query.get(flight_id)
    if not flight:
        return jsonify({"error": "NOT_FOUND", "message": "Flight not found"}), 404
    if flight.approval_status != "PENDING":
        return jsonify({"error": "VALIDATION", "message": "Only PENDING flights can be approved"}), 400

    flight.approval_status = "APPROVED"
    flight.rejection_reason = None
    flight.approved_by_user_id = current_user_id()
    flight.approved_at = utcnow()
    db.session.commit()
    return jsonify(flight_response(flight))


@api.post("/flights/<int:flight_id>/reject")
@require_roles(["ADMIN"])
def reject_flight(flight_id: int):
    flight = Flight.query.get(flight_id)
    if not flight:
        return jsonify({"error": "NOT_FOUND", "message": "Flight not found"}), 404
    if flight.approval_status != "PENDING":
        return jsonify({"error": "VALIDATION", "message": "Only PENDING flights can be rejected"}), 400

    data = get_json_or_form(request)
    reason = str(data.get("reason") or data.get("rejection_reason") or "").strip()
    if not reason:
        return jsonify({"error": "VALIDATION", "message": "reason is required"}), 400

    flight.approval_status = "REJECTED"
    flight.rejection_reason = reason
    flight.approved_by_user_id = current_user_id()
    flight.approved_at = utcnow()
    db.session.commit()
    return jsonify(flight_response(flight))


@api.post("/flights/<int:flight_id>/cancel")
@require_roles(["ADMIN"])
def cancel_flight(flight_id: int):
    flight = Flight.query.get(flight_id)
    if not flight:
        return jsonify({"error": "NOT_FOUND", "message": "Flight not found"}), 404

    state, _ = compute_runtime_state(flight)
    if state == "IN_PROGRESS":
        return jsonify({"error": "VALIDATION", "message": "Cannot cancel while in progress"}), 400

    if flight.canceled:
        return jsonify(flight_response(flight))

    flight.canceled = True
    flight.canceled_by_user_id = current_user_id()
    flight.canceled_at = utcnow()
    db.session.commit()
    return jsonify(flight_response(flight))


@api.get("/flights/<int:flight_id>/buyers")
@require_roles(["ADMIN"])
def flight_buyers(flight_id: int):
    """Return list of user_ids who completed purchase for this flight.

    Used by Server to send cancellation emails.
    """
    flight = Flight.query.get(flight_id)
    if not flight:
        return jsonify({"error": "NOT_FOUND", "message": "Flight not found"}), 404

    buyers = (
        db.session.query(Purchase.user_id)
        .filter(Purchase.flight_id == flight_id)
        .filter(Purchase.status == "COMPLETED")
        .distinct()
        .all()
    )

    return jsonify({"flight_id": flight_id, "buyers": [b[0] for b in buyers]})
