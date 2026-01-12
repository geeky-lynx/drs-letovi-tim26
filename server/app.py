from typing import Optional
from flask import Flask, request, session, flash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Date, Float, String, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
import bcrypt

from server.env_loader import load_local_env



local_env = dict()
try:
    local_env = load_local_env()
except Exception as error:
    print("Error occured")
    print(f"{error}")
    exit(2)

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = local_env["SQLALCHEMY_DATABASE_URI"]

class DbBase(DeclarativeBase):
    pass
    
db = SQLAlchemy(model_class = DbBase)
SALT = bcrypt.gensalt()



class User(db.Model):
    __tablename__ = "users"
    
    id: Mapped[int]                    = mapped_column(Integer, primary_key = True)
    email: Mapped[str]                 = mapped_column(String(50), unique = True, nullable = False)
    password: Mapped[str]              = mapped_column(String(500), nullable = False)
    role: Mapped[str]                  = mapped_column(String(8), nullable = False) # USER | MANAGER | ADMIN
    first_name: Mapped[Optional[str]]  = mapped_column(String(25))
    last_name: Mapped[Optional[str]]   = mapped_column(String(25))
    birth_date: Mapped[Optional[Date]] = mapped_column(Date)
    gender: Mapped[Optional[str]]      = mapped_column(String(1)) # M | F | _
    country: Mapped[Optional[str]]     = mapped_column(String(30)) # encrypted
    street: Mapped[Optional[str]]      = mapped_column(String(50)) # encrypted
    balance: Mapped[float]             = mapped_column(Float, nullable = False, default = 0.0)
    
    def __repr__(self) -> str:
        return f"User{{id={self.id!r}, email={self.email!r}}}"



@app.route("/ping-reachable")
def ping_reachable():
    return "<p>Server is reachable</p>"
