from __future__ import annotations

from datetime import datetime

from . import db


class Airline(db.Model):
    __tablename__ = "airlines"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)

    def to_dict(self) -> dict:
        return {"id": self.id, "name": self.name}


class Flight(db.Model):
    __tablename__ = "flights"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)

    airline_id = db.Column(db.Integer, db.ForeignKey("airlines.id"), nullable=False)
    airline = db.relationship("Airline", lazy="joined")

    distance_km = db.Column(db.Float, nullable=False)
    duration_seconds = db.Column(db.Integer, nullable=False)  # stored in seconds

    departure_time = db.Column(db.DateTime, nullable=False)
    origin_airport = db.Column(db.String(120), nullable=False)
    destination_airport = db.Column(db.String(120), nullable=False)

    created_by_user_id = db.Column(db.String(64), nullable=False)
    price = db.Column(db.Float, nullable=False)

    # Approval workflow
    approval_status = db.Column(db.String(20), nullable=False, default="PENDING")
    rejection_reason = db.Column(db.String(500), nullable=True)
    approved_by_user_id = db.Column(db.String(64), nullable=True)
    approved_at = db.Column(db.DateTime, nullable=True)

    # Cancellation
    canceled = db.Column(db.Boolean, nullable=False, default=False)
    canceled_by_user_id = db.Column(db.String(64), nullable=True)
    canceled_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict_base(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "airline": self.airline.to_dict() if self.airline else None,
            "distance_km": self.distance_km,
            "duration_seconds": self.duration_seconds,
            "departure_time": self.departure_time.isoformat(),
            "origin_airport": self.origin_airport,
            "destination_airport": self.destination_airport,
            "created_by_user_id": self.created_by_user_id,
            "price": self.price,
            "approval_status": self.approval_status,
            "rejection_reason": self.rejection_reason,
            "approved_by_user_id": self.approved_by_user_id,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "canceled": self.canceled,
            "canceled_by_user_id": self.canceled_by_user_id,
            "canceled_at": self.canceled_at.isoformat() if self.canceled_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Purchase(db.Model):
    __tablename__ = "purchases"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(64), nullable=False, index=True)
    flight_id = db.Column(db.Integer, db.ForeignKey("flights.id"), nullable=False, index=True)
    flight = db.relationship("Flight", lazy="joined")

    status = db.Column(db.String(20), nullable=False, default="PENDING")  # PENDING/COMPLETED/FAILED
    failure_reason = db.Column(db.String(500), nullable=True)

    price_paid = db.Column(db.Float, nullable=False)
    purchased_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "flight_id": self.flight_id,
            "status": self.status,
            "failure_reason": self.failure_reason,
            "price_paid": self.price_paid,
            "purchased_at": self.purchased_at.isoformat() if self.purchased_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "flight": self.flight.to_dict_base() if self.flight else None,
        }


class Rating(db.Model):
    __tablename__ = "ratings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(64), nullable=False, index=True)
    flight_id = db.Column(db.Integer, db.ForeignKey("flights.id"), nullable=False, index=True)
    flight = db.relationship("Flight", lazy="joined")

    rating = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("user_id", "flight_id", name="uq_rating_user_flight"),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "flight_id": self.flight_id,
            "rating": self.rating,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "flight": self.flight.to_dict_base() if self.flight else None,
        }
