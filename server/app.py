from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Date, Float, String, Integer

from server.env_loader import load_local_env



local_env = dict()
try:
    local_env = load_local_env()
except Exception as error:
    print("Error occured")
    print(f"{error}")

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = local_env["SQLALCHEMY_DATABASE_URI"]

db = SQLAlchemy(app)



class Users(db.Model):
    __tablename__ = "users"
    
    id          = db.Column("id", Integer, primary_key = True)
    email       = db.Column("email", String(50), unique = True, nullable = False)
    password    = db.Column("password", String(500), nullable = False)
    role        = db.Column("role", String(8), nullable = False) # USER | MANAGER | ADMIN
    first_name  = db.Column("first_name", String(25))
    last_name   = db.Column("last_name", String(25))
    birth_date  = db.Column("birth_date", Date)
    gender      = db.Column("gender", String(1))
    country     = db.Coluumn("country", String(30)) # encrypted
    street      = db.Column("street", String(50)) # encrypted
    balance     = db.Column("balance", Float)
    
    def __init__(self,
        email,
        password,
        role,
        first_name,
        last_name,
        birth_date,
        gender,
        country,
        street,
        balance
    ):
        # __init__ body
        self.email      = email
        self.password   = password
        self.role       = role
        self.first_name = first_name
        self.last_name  = last_name
        self.birth_date = birth_date
        self.gender     = gender
        self.country    = country
        self.street     = street
        self.balance    = balance



@app.route("/ping-reachable")
def ping_reachable():
    return "<p>Server is reachable</p>"
