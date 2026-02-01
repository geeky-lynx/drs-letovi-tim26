from datetime import datetime
from sqlalchemy import DateTime, Float, String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional

from setup import db



class User(db.Model):
    __tablename__ = "users"

    id: Mapped[int]                        = mapped_column(Integer, primary_key = True)
    email: Mapped[str]                     = mapped_column(String(50), unique = True, nullable = False)
    password: Mapped[bytes]                = mapped_column(String(500), nullable = False)
    role: Mapped[str]                      = mapped_column(String(8), nullable = False) # USER | MANAGER | ADMIN
    pfp_url: Mapped[str]                   = mapped_column(String(256))
    first_name: Mapped[Optional[str]]      = mapped_column(String(25))
    last_name: Mapped[Optional[str]]       = mapped_column(String(25))
    birth_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    gender: Mapped[Optional[str]]          = mapped_column(String(1)) # M | F | _
    country: Mapped[Optional[str]]         = mapped_column(String(30)) # encrypted
    street: Mapped[Optional[str]]          = mapped_column(String(50)) # encrypted
    balance: Mapped[float]                 = mapped_column(Float, nullable = False, default = 0.0)

    def __repr__(self) -> str:
        return f"User{{id={self.id!r}, email={self.email!r}}}"

    # Utility methods
    def to_dto(self):
        bdate = self.birth_date
        if bdate is None:
            bdate = datetime.fromisoformat("1900-01-01")
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "birth_date": datetime.strftime(bdate, "%Y-%m-%d"),
            "gender": self.gender,
            "country": self.country,
            "street": self.street,
            "balance": self.balance
        }
