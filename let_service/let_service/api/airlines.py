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
