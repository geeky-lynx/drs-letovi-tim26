import re as regex
from os import getenv
from datetime import datetime
from base64 import standard_b64decode as base64encode
from typing import Optional
from dotenv import load_dotenv
from flask import Flask, request, session, flash, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import DateTime, Float, String, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
import bcrypt
import jwt



# Validate functions
def is_email_valid(email: str) -> bool:
    if '@' not in email:
        return False
    [user, domain] = email.split('@')
    if len(user) < 1 or '.' not in domain:
        return False
        
    for char in user.lower():
        if char not in "abcdefghijklmnopqrstuvxqz1234567890.":
            return False
    for char in domain.lower():
        if char not in "abcdefghijklmnopqrstuvxqz1234567890.":
            return False
    
    [host, compart] = domain.split('.', 1)
    if len(host) < 1 or len(compart) < 2:
        return False
    return True



def is_password_valid(password: str) -> bool:
    length = len(password)
    if 8 > length or length > 25:
        return False
    if regex.search(r"[a-zA-Z0-9.,?!@#$%^&*_\;-]+", password) is None:
        return False
    return True



try:
    load_dotenv()
except Exception as error:
    print("Error occured")
    print(f"{error}")
    exit(2)
print("Local .env is loaded")

app = Flask(__name__)
CORS(app)

SECRET_KEY = getenv("SECRET_KEY")
DB_URI = getenv("SQLALCHEMY_DATABASE_URI")

# Stop the program if there are no config parameters
if SECRET_KEY is None:
    print("SECRET_KEY == None! Can\'t proceed with running Flask instance")
    exit(2)

if DB_URI is None:
    print("DB_URI == None! Can\'t proceed with running Flask instance")
    exit(2)


app.config["SQLALCHEMY_DATABASE_URI"] = DB_URI
app.secret_key = SECRET_KEY

class DbBase(DeclarativeBase):
    pass

db = SQLAlchemy(app, model_class = DbBase)
SALT = bcrypt.gensalt()



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



@app.route("/ping-reachable")
def ping_reachable():
    return "<p>Server is reachable</p>"


@app.route("/auth/login", methods = ["POST"])
def user_login():
    if "user" in session and session["user"] != "":
        return jsonify({"message": "Already logged in"}), 400

    if request.method != "POST":
        return jsonify({"message": "Invalid HTTP method"}), 400

    req_data = request.get_json()

    # is_email_empty = user_email is None or user_email == ""
    # is_password_empty = unhashed_password is None or unhashed_password == ""
    if ("email" not in req_data or "password" not in req_data):
        return jsonify({"message": "Invalid form request"}), 400

    user_email = req_data["email"]
    unhashed_password = req_data["password"]

    if not is_email_valid(user_email):
        flash("Invalid email", "error")
        return jsonify({"message": "Incorrect email"}), 400

    if not is_password_valid(unhashed_password):
        flash("Invalid password", "error")
        return jsonify({"message": "Incorrect password"}), 400

    _query: (User | None) = User.query.filter_by(email = user_email).first()
    if _query is None:
        flash("Incorrect email or password (or this account doesn\'t exist)", "error")
        return jsonify({"message": "Incorrect email or password (or this account doesn\'t exist)"}), 400

    query: User = _query
    plain: bytes = unhashed_password.encode("utf-8")
    hashed = query.password
    is_password_correct = False
    try:
        is_password_correct = bcrypt.checkpw(
            plain,
            bytes.fromhex(hashed[2:])
        )
    except ValueError as error:
        print("ValueError EXCEPTION: hashes not matched")
        print("Stacktrace:")
        print(error)

    if query is None or not is_password_correct:
        flash("Incorrect email or password (or this account doesn\'t exist)", "error")
        return jsonify({"message": "Incorrect email or password (or this account doesn\'t exist)"}), 400

    birth_date = query.birth_date
    if birth_date is None:
        birth_date = datetime.fromisoformat("1900-01-01")
    dto = {
        "id": query.id,
        "email": query.email,
        "role": query.role,
        "first_name": query.first_name,
        "last_name": query.last_name,
        "birth_date": datetime.strftime(birth_date, "%Y-%m-%d"),
        "gender": query.gender,
        "country": query.country,
        "street": query.street,
        "balance": query.balance
    }

    # This is added to silence linter errors
    if SECRET_KEY is None:
        print("SECRET_KEY == None! SHOULD NEVER HAPPEN")
        return
    secret: str = SECRET_KEY
    token = jwt.encode(dto, secret)
    return jsonify({"message": "Successfully logged in", "token": token}), 200



@app.route("/auth/register", methods = ["POST"])
def user_register():
    if "user" in session and session["user"] != "":
        return jsonify({"message": "Logged in; must logout first"}), 400

    if request.method != "POST":
        return jsonify({"message": "Invalid HTTP method"}), 400

    req_data = request.get_json()

    is_email_empty = "email" not in req_data
    is_password_empty = "password" not in req_data
    is_repeated_empty = "password_repeated" not in req_data
    if (is_email_empty or is_password_empty or is_repeated_empty):
        return jsonify({"message": "Invalid form request"}), 400

    user_email = req_data["email"]
    unhashed_password = req_data["password"]
    repeated_password = req_data["password_repeated"]

    if not is_email_valid(user_email):
        flash("Invalid email", "error")
        return jsonify({"message": "Incorrect email"}), 400

    if not is_password_valid(unhashed_password):
        flash("Invalid password", "error")
        return jsonify({"message": "Incorrect password"}), 400

    if not is_password_valid(repeated_password):
        flash("Invalid repeated password", "error")
        return jsonify({"message": "Incorrect repeated password"}), 400

    old_user = User.query.filter_by(email = user_email).first()
    if old_user is not None:
        return jsonify({"message": "User with that email already exists"}), 400

    if unhashed_password != repeated_password:
        flash("Passwords don\'t match", "error")
        return jsonify({"message": "Passwords don\'t match"}), 400

    hashed_password = bcrypt.hashpw(unhashed_password.encode("utf-8"), SALT)
    print("register: hashed password")
    print(hashed_password)
    role = req_data["role"] if "role" in req_data else "USER"
    first_name = req_data.get("first_name")
    last_name = req_data.get("last_name")
    _birth_date = req_data.get("birth_date")
    if _birth_date is None:
        _birth_date = "1900-01-01"
    birth_date = datetime.strptime(_birth_date, "%Y-%m-%d")
    gender = req_data.get("gender")
    country = req_data.get("country")
    if country is None:
        country = ""
    street = req_data.get("street")
    if street is None:
        street = ""

    new_user = User()
    new_user.email = user_email
    new_user.password = hashed_password
    new_user.role = role
    new_user.first_name = first_name
    new_user.last_name = last_name
    new_user.birth_date = birth_date
    new_user.gender = gender
    new_user.country = str(base64encode(country))
    new_user.street = str(base64encode(street))    

    dto = {
        "id": new_user.id,
        "email": new_user.email,
        "role": new_user.role,
        "first_name": new_user.first_name,
        "last_name": new_user.last_name,
        "birth_date": datetime.strftime(birth_date, "%Y-%m-%d"),
        "gender": new_user.gender,
        "country": new_user.country,
        "street": new_user.street,
        "balance": new_user.balance
    }

    # This is added to silence linter errors
    if SECRET_KEY is None:
        print("SECRET_KEY == None! SHOULD NEVER HAPPEN")
        return
    secret: str = SECRET_KEY
    token = jwt.encode(dto, secret)

    # Add user AFTER JWT encoding is done
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Successfully registered", "token": token}), 200



if "__main__" == __name__:
    with app.app_context():
        db.create_all()
    app.run(port = 8800, debug = True)