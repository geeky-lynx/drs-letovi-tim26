from __future__ import annotations

from flask import jsonify, request

from ..db import db
from ..db.models import Airline
from ..utils.auth import require_roles
from ..utils.http import get_json_or_form
from . import api


@api.get("/airlines")
def list_airlines():
    airlines = Airline.query.order_by(Airline.name.asc()).all()
    return jsonify([a.to_dict() for a in airlines])


@api.get("/airlines/<int:airline_id>")
def get_airline_by_id(airline_id: int):
    airline = Airline.query.filter_by(id = airline_id).order_by(Airline.name.asc()).first()
    return jsonify(airline)


@api.post("/airlines")
@require_roles(["ADMIN", "MANAGER"])
def create_airline():
    data = get_json_or_form(request)
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "VALIDATION", "message": "name is required"}), 400

    existing = Airline.query.filter_by(name=name).first()
    if existing:
        return jsonify(existing.to_dict()), 200

    airline = Airline(name=name)
    db.session.add(airline)
    db.session.commit()
    return jsonify(airline.to_dict()), 201


@api.delete("/airlines/<int:airline_id>")
@require_roles(["ADMIN", "MANAGER"])
def remove_airline(airline_id: int):
    existing = Airline.query.filter_by(id = airline_id).first()
    if not existing:
        return jsonify({"message": "Airline does not exist"}), 404

    db.session.delete(existing)
    db.session.commit()
    return jsonify({"message": "Airline successfully removed"}), 201
