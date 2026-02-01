from datetime import datetime
from base64 import standard_b64decode as base64encode

from flask import request, session, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
import bcrypt
import jwt

from setup import app, db, SALT, SECRET_KEY
from models import User
from input_validator import is_email_valid, is_password_valid



@app.route("/ping-reachable")
def ping_reachable():
    return "<p>Server is reachable</p>"



@app.route("/auth/login", methods = ["POST"])
def user_login():
    if "user" in session and session["user"] != "":
        return jsonify({"message": "Already logged in"}), 400

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
