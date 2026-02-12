from datetime import datetime
from base64 import standard_b64decode as base64encode

from flask import request, session, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
import requests
import bcrypt
import jwt

from setup import app, db, redis, SALT, SECRET_KEY, LOGIN_TIMEOUT_SECONDS, LET_SERVICE_URL
from models import User
from input_validator import is_email_valid, is_password_valid, is_password_matching



failed_logins = {}



@app.route("/ping-reachable")
def ping_reachable():
    return "<p>Server is reachable</p>"



@app.route("/auth/login", methods = ["POST"])
def user_login():
    req_data = request.get_json()

    if ("email" not in req_data or "password" not in req_data):
        return jsonify({"message": "Invalid form request"}), 400

    user_email = req_data["email"]
    unhashed_password = req_data["password"]

    # Check if the user has maxed out its attempts (3) for a time
    last_attempt = failed_logins.get(user_email)
    if last_attempt is not None:
        last_time = last_attempt["last_time"]
        round = last_attempt["round"]
        diff = datetime.now() - last_time
        if diff.total_seconds() < LOGIN_TIMEOUT_SECONDS and round >= 3:
            flash("Too many login attempts. Try again later", "error")
            return jsonify({"message": "Too many login attempts. Try again later"}), 400

        # The user has waited enough: Allow to try again
        if diff.total_seconds() > LOGIN_TIMEOUT_SECONDS:
            last_attempt.pop(user_email)

    if not is_email_valid(user_email):
        flash("Invalid email", "error")
        return jsonify({"message": "Invalid email"}), 400

    if not is_password_valid(unhashed_password):
        flash("Invalid password", "error")
        return jsonify({"message": "Invalid password"}), 400

    # _r_query = redis.get(user_email)
    # if _r_query is None:
    #     _query = _r_query

    _query: (User | None) = User.query.filter_by(email = user_email).first()
    if _query is None:
        flash("Incorrect email or password (or this account doesn\'t exist)", "error")
        return jsonify({"message": "Incorrect email or password (or this account doesn\'t exist)"}), 400

    query: User = _query
    is_password_correct = is_password_matching(unhashed_password, query.password)

    if not is_password_correct:
        attempts = failed_logins.get(user_email)
        if attempts is None:
            attempts = {"last_time": datetime.now(), "round": 0}
        else:
            attempts["last_time"] = datetime.now()
            attempts["round"] += 1
        failed_logins[user_email] = attempts

        flash("Incorrect email or password (or this account doesn\'t exist)", "error")
        return jsonify({"message": "Incorrect email or password (or this account doesn\'t exist)"}), 400
        

    dto = query.to_dto()
    # redis.set(user_email, dto)
    token = jwt.encode(dto, SECRET_KEY)

    return jsonify({"message": "Successfully logged in", "token": token}), 200



@app.route("/auth/register", methods = ["POST"])
def user_register():
    req_data = request.get_json()

    is_email_empty = "email" not in req_data
    is_password_empty = "password" not in req_data
    is_repeated_empty = "confirmPassword" not in req_data
    if (is_email_empty or is_password_empty or is_repeated_empty):
        return jsonify({"message": "Invalid form request"}), 400

    user_email = req_data["email"]
    unhashed_password = req_data["password"]
    repeated_password = req_data["confirmPassword"]

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
    first_name = req_data.get("firstName")
    last_name = req_data.get("lastName")
    _birth_date = req_data.get("dateOfBirth")
    if _birth_date is None:
        _birth_date = "1900-01-01"
    birth_date = datetime.strptime(_birth_date, "%Y-%m-%d")
    gender = req_data.get("gender")
    country = req_data.get("state")
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

    dto = new_user.to_dto()
    token = jwt.encode(dto, SECRET_KEY)

    # Add user AFTER JWT encoding is done
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Successfully registered", "token": token}), 200



# Admin routes

@app.route("/admin/get-all-users")
def get_all_users():
    req_data = request.get_json()

    is_token_empty = "token" not in req_data

    if is_token_empty:
        return jsonify({"message": "Invalid form request"}), 400

    token = req_data["token"]

    authed = jwt.decode(token, SECRET_KEY)
    if authed.get("role") != "ADMIN":
        return jsonify({"message": "Unauthorized to access"}), 400

    _users = db.session.execute(db.select(User)).scalars()
    users = [user.to_dto() for user in _users]

    return jsonify({"message": "Successfully got user info", "user": users}), 200



@app.route("/admin/get-user")
def get_user_info():
    req_data = request.get_json()

    is_token_empty = "token" not in req_data
    is_user_id_empty = "userId" not in req_data

    if is_token_empty or is_user_id_empty:
        return jsonify({"message": "Invalid form request"}), 400

    token = req_data["token"]
    _user_id = req_data["userId"]
    user_id = int(_user_id)

    authed = jwt.decode(token, SECRET_KEY)
    if authed.get("id") != user_id or authed.get("role") != "ADMIN":
        return jsonify({"message": "Unauthorized to access"}), 400

    _user = User.query.filter_by(id = int(user_id)).first()
    if _user is None:
        return jsonify({"message": "User does not exist"}), 400
    user = None if _user is None else _user.to_dto()

    return jsonify({"message": "Successfully got user info", "user": user}), 200



@app.route("/admin/update-user")
def update_user_info():
    req_data = request.get_json()

    is_token_empty = "token" not in req_data
    is_user_id_empty = "userId" not in req_data

    if is_token_empty or is_user_id_empty:
        return jsonify({"message": "Invalid form request"}), 400

    token = req_data["token"]
    _user_id = req_data["userId"]
    user_id = int(_user_id)

    authed = jwt.decode(token, SECRET_KEY)
    if authed.get("id") != user_id or authed.get("role") != "ADMIN":
        return jsonify({"message": "Unauthorized to update"}), 400

    # _user = User.query.filter_by(id = user_id).first()
    _user = db.session.execute(db.select(User).filter_by(id = user_id)).scalar_one()
    if _user is None:
        return jsonify({"message": "User does not exist"}), 400

    user: User = _user

    if "email" in req_data:
        user.email = req_data["email"]

    if "role" in req_data:
        user.role = req_data["role"]

    if "profileImage" in req_data:
        user.pfp_url = req_data["profileImage"]

    if "firstName" in req_data:
        user.first_name = req_data["firstName"]

    if "lastName" in req_data:
        user.last_name = req_data["lastName"]

    if "dateOfBirth" in req_data:
        user.birth_date = datetime.strftime(req_data["dateOfBirth"], "%Y-%m-%d")

    if "gender" in req_data:
        user.gender = req_data["gender"]

    if "country" in req_data:
        user.country = str(base64encode(req_data["country"]))

    if "street" in req_data:
        user.street = str(base64encode(req_data["street"]))

    if "accountBalance" in req_data:
        user.balance = float(req_data["balance"])

    db.session.commit()

    return jsonify({"message": "Successfully updated the user"}), 200



# User routes

@app.post("/user/update-info")
def update_user_info__not_admin():
    req_data = request.get_json()

    is_token_empty = "token" not in req_data

    if is_token_empty:
        return jsonify({"message": "Invalid form request"}), 400

    token = req_data["token"]

    authed = jwt.decode(token, SECRET_KEY)
    # if authed.get("id") != user_id or authed.get("role") != "ADMIN":
        # return jsonify({"message": "Unauthorized to update"}), 400

    # _user = User.query.filter_by(id = user_id).first()
    _user = db.session.execute(db.select(User).filter_by(id = authed.get("id"))).scalar_one()
    if _user is None:
        return jsonify({"message": "User does not exist"}), 400

    user: User = _user

    if authed.get("id") != user.id:
        return jsonify({"message": "Unauthorized to update"}), 400

    if "email" in req_data:
        user.email = req_data["email"]

    if "role" in req_data:
        user.role = req_data["role"]

    if "profileImage" in req_data:
        user.pfp_url = req_data["profileImage"]

    if "firstName" in req_data:
        user.first_name = req_data["firstName"]

    if "lastName" in req_data:
        user.last_name = req_data["lastName"]

    if "dateOfBirth" in req_data:
        user.birth_date = datetime.strftime(req_data["dateOfBirth"], "%Y-%m-%d")

    if "gender" in req_data:
        user.gender = req_data["gender"]

    if "country" in req_data:
        user.country = str(base64encode(req_data["country"]))

    if "street" in req_data:
        user.street = str(base64encode(req_data["street"]))

    if "accountBalance" in req_data:
        user.balance = float(req_data["balance"])

    db.session.commit()

    return jsonify({"message": "Successfully updated the user"}), 200



@app.route("/user/all_purchases/<int:user_id>", methods = ["GET"])
def user_get_purchases(user_id: int):
    req_data = request.get_json()
    
    if "token" not in req_data:
        return jsonify({"message": "Not authentificated"}), 400

    res = requests.delete(f"{LET_SERVICE_URL}/users/{user_id}/purchases")
    
    if res.status_code >= 400:
        return jsonify({"message": "Error occured", "reason": res.json().get("message")}), res.status_code
    
    return jsonify({"message": "User's purchases fetched", "data": res.json()}), 200



# Airlines routes

@app.route("/airlines/get", methods = ["GET"])
def airlines_get_all():
    data = requests.get(f"{LET_SERVICE_URL}/airlines")
    return jsonify({"message": "Retrieved all airlines", "data": data.json()}), 200



@app.route("/airlines/get/<int:airline_id>", methods = ["GET"])
def airlines_get_by_id(airline_id: int):
    data = requests.get(f"{LET_SERVICE_URL}/airlines/{airline_id}")
    return jsonify({"message": "Retrieved an airline", "data": data.json()}), 200


@app.route("/airlines/set", methods = ["POST"])
def airlines_new_or_get_existing():
    headers = {"Content-Type": "application/json"}
    req_data = request.get_json()
    
    if "token" not in req_data:
        return jsonify({"message": "Not authentificated"}), 400
        
    authed = jwt.decode(req_data["token"], SECRET_KEY)
    if authed.role not in ["MANAGER", "ADMIN"]:
        return jsonify({"message": "Unauthorized"}), 400
    
    
    if "name" not in req_data:
        return jsonify({"message": "Invalid request (no 'name' provided)"}), 400
    
    payload = {"name": req_data["name"]}
    res = requests.post(
        f"{LET_SERVICE_URL}/airlines",
        headers = headers,
        json = payload
    )
    
    if res.status_code >= 400:
        return jsonify({"message": "Error occured", "reason": res.json().get("message")}), res.status_code
        
    return jsonify({"message": "Created a new or fetched existing airline", "data": res.json()}), 200
    
    
    
@app.route("/airlines/remove/<airline_id>")
def airlines_remove_by_id(airline_id: int):
    req_data = request.get_json()
    
    if "token" not in req_data:
        return jsonify({"message": "Not authentificated"}), 400
        
    authed = jwt.decode(req_data["token"], SECRET_KEY)
    if authed.role not in ["MANAGER", "ADMIN"]:
        return jsonify({"message": "Unauthorized"}), 400
    
    res = requests.delete(f"{LET_SERVICE_URL}/airlines")
    
    if res.status_code >= 400:
        return jsonify({"message": "Error occured", "reason": res.json().get("message")}), res.status_code
        
    return jsonify({"message": "Removed the airline"}), 200



# Flights routes

@app.route("/flights/get-all-that", methods = ["GET"])
def flights_get_all():
    req_data = request.form
    payload = {
        "airline_id": req_data.get("airlineId"),
        "approval": req_data.get("approval_status"),
        "query": req_data.get("query"),
        "tab": req_data.get("tab")
    }
    
    res = requests.get(
        f"{LET_SERVICE_URL}/flights",
        data = payload
    )
    
    if res.status_code >= 400:
        return jsonify({"message": "Error occured", "reason": res.json().get("message")}), res.status_code
    
    return jsonify({"message": "Retrieved flights data", "data": res.json()}), 200


@app.route("/flights/get/<int:flight_id>", methods = ["GET"])
def flights_get_by_id(flight_id: int):
    # req_data = request.form
    # payload = {"airline_id": req_data.get("airlineId"), "approval": req_data.get("approval_status")}
    res = requests.get(
        f"{LET_SERVICE_URL}/flights/{flight_id}",
        # data = payload
    )
    
    if res.status_code >= 400:
        return jsonify({"message": "Error occured", "reason": res.json().get("message")}), res.status_code
    
    return jsonify({"message": "Retrieved flights data", "data": res.json()}), 200




@app.route("/flights/new", methods = ["POST"])
def flights_create_new():
    req_data = request.get_json()
    headers = {"Content-Type": "application/json"}
    payload = {
        "name": req_data.get("name"),
        "airline_id": req_data.get("airline_id"),
        "distance_km": req_data.get("distance_km"),
        "duration_seconds": req_data.get("duration_seconds"),
        "departure_time": req_data.get("departure_time"),
        "origin_airport": req_data.get("origin_airport"),
        "destination_airport": req_data.get("destination_airport"),
        "price": req_data.get("price")
    }
    
    res = requests.post(
        f"{LET_SERVICE_URL}/flights",
        headers = headers,
        json = payload
    )
    
    if res.status_code >= 400:
        return jsonify({"message": "Error occured", "reason": res.json().get("message")}), res.status_code
    
    return jsonify({"message": "Created new flight", "data": res.json()}), 200



@app.route("/flights/update/<int:flight_id>", methods = ["PUT"])
def flights_update_one(flight_id: int):
    req_data = request.get_json()
    headers = {"Content-Type": "application/json"}
    
    if "token" not in req_data:
        return jsonify({"message": "Not authentificated"}), 400
        
    authed = jwt.decode(req_data["token"], SECRET_KEY)
    if authed.role not in ["MANAGER", "ADMIN"]:
        return jsonify({"message": "Unauthorized"}), 400
    
    res = requests.put(
        f"{LET_SERVICE_URL}/flights/{flight_id}",
        headers = headers,
        json = req_data
    )
    
    if res.status_code >= 400:
        return jsonify({"message": "Error occured", "reason": res.json().get("message")}), res.status_code
    
    return jsonify({"message": "Flight updated", "data": res.json()}), 200
    
    

@app.route("/flights/remove/<int:flight_id>", methods = ["DELETE"])
def flights_remove_one(flight_id: int):
    req_data = request.get_json()
    
    if "token" not in req_data:
        return jsonify({"message": "Not authentificated"}), 400
        
    authed = jwt.decode(req_data["token"], SECRET_KEY)
    if authed.role not in ["MANAGER", "ADMIN"]:
        return jsonify({"message": "Unauthorized"}), 400
    
    res = requests.delete(f"{LET_SERVICE_URL}/flights/{flight_id}")
    
    if res.status_code >= 400:
        return jsonify({"message": "Error occured", "reason": res.json().get("message")}), res.status_code
    
    return jsonify({"message": "Flight removed", "data": res.json()}), 200



@app.route("/flights/approve/<int:flight_id>", methods = ["POST"])
def flights_approve(flight_id: int):
    req_data = request.get_json()
    
    if "token" not in req_data:
        return jsonify({"message": "Not authentificated"}), 400
        
    authed = jwt.decode(req_data["token"], SECRET_KEY)
    if authed.role not in ["MANAGER", "ADMIN"]:
        return jsonify({"message": "Unauthorized"}), 400
    
    res = requests.post(f"{LET_SERVICE_URL}/flights/{flight_id}")
    
    if res.status_code >= 400:
        return jsonify({"message": "Error occured", "reason": res.json().get("message")}), res.status_code
    
    return jsonify({"message": "Flight approved", "data": res.json()}), 200



@app.route("/flights/reject/<int:flight_id>", methods = ["POST"])
def flights_reject(flight_id: int):
    req_data = request.get_json()
    
    if "token" not in req_data:
        return jsonify({"message": "Not authentificated"}), 400
        
    authed = jwt.decode(req_data["token"], SECRET_KEY)
    if authed.role not in ["MANAGER", "ADMIN"]:
        return jsonify({"message": "Unauthorized"}), 400
    
    res = requests.post(f"{LET_SERVICE_URL}/flights/{flight_id}")
    
    if res.status_code >= 400:
        return jsonify({"message": "Error occured", "reason": res.json().get("message")}), res.status_code
    
    return jsonify({"message": "Flight rejected", "data": res.json()}), 200



@app.route("/flights/cancel/<int:flight_id>", methods = ["POST"])
def flights_cancel(flight_id: int):
    req_data = request.get_json()
    
    if "token" not in req_data:
        return jsonify({"message": "Not authentificated"}), 400
        
    authed = jwt.decode(req_data["token"], SECRET_KEY)
    if authed.role not in ["MANAGER", "ADMIN"]:
        return jsonify({"message": "Unauthorized"}), 400
    
    res = requests.post(f"{LET_SERVICE_URL}/flights/{flight_id}")
    
    if res.status_code >= 400:
        return jsonify({"message": "Error occured", "reason": res.json().get("message")}), res.status_code
    
    return jsonify({"message": "Flight cancelled", "data": res.json()}), 200



@app.route("/flights/buyers/<int:flight_id>", methods = ["GET"])
def flights_buyers(flight_id: int):
    req_data = request.get_json()
    
    if "token" not in req_data:
        return jsonify({"message": "Not authentificated"}), 400
        
    authed = jwt.decode(req_data["token"], SECRET_KEY)
    if authed.role not in ["ADMIN"]:
        return jsonify({"message": "Unauthorized"}), 400
    
    res = requests.get(f"{LET_SERVICE_URL}/flights/{flight_id}/buyers")
    
    if res.status_code >= 400:
        return jsonify({"message": "Error occured", "reason": res.json().get("message")}), res.status_code
    
    return jsonify({"message": "Not implemented", "data": res.json()}), 200



# Purchases routes

@app.route("/purchases/buy", methods = ["POST"])
def purchases_buy():
    req_data = {}
    if request.is_json:
        req_data = request.get_json()
    else:
        req_data = request.form
    
    headers = {"Content-Type": "application/json"}
    
    if "token" not in req_data:
        return jsonify({"message": "Not authentificated"}), 400
        
    # authed = jwt.decode(req_data["token"], SECRET_KEY)
    # if authed.role not in ["ADMIN"]:
    #     return jsonify({"message": "Unauthorized"}), 400
    
    res = requests.post(
        f"{LET_SERVICE_URL}/purchases",
        headers = headers,
        json = req_data
    )
    
    if res.status_code >= 400:
        return jsonify({"message": "Error occured", "reason": res.json().get("message")}), res.status_code
    
    return jsonify({"message": "Purchase done", "data": res.json()}), 200



# Ratings routes

@app.route("/ratings/get", methods = ["GET"])
def ratings_get_all():
    req_data = {}
    if request.is_json:
        req_data = request.get_json()
    else:
        req_data = request.form
    
    if "token" not in req_data:
        return jsonify({"message": "Not authentificated"}), 400
        
    headers = {"Content-Type": "application/json"}
    payload = {
        "flight_id": req_data.get("flight_id"),
        "user_id": req_data.get("user_id")
    }
    
    res = requests.get(
        f"{LET_SERVICE_URL}/ratings",
        headers = headers,
        json = payload
    )
    
    if res.status_code >= 400:
        return jsonify({"message": "Error occured", "reason": res.json().get("message")}), res.status_code
    
    return jsonify({"message": "Ratings fetched", "data": res.json()}), 200



@app.route("/ratings/new_or_update", methods = ["POST"])
def ratings_set_all():
    req_data = {}
    if request.is_json:
        req_data = request.get_json()
    else:
        req_data = request.form
    
    if "token" not in req_data:
        return jsonify({"message": "Not authentificated"}), 400
        
    authed = jwt.decode(req_data["token"], SECRET_KEY)
        
    headers = {"Content-Type": "application/json"}
    payload = {
        "user_id": authed.get("user_id"),
        "flight_id": req_data.get("flight_id"),
        "rating": req_data.get("rating")
    }
    
    res = requests.post(
        f"{LET_SERVICE_URL}/ratings",
        headers = headers,
        json = payload
    )
    
    if res.status_code >= 400:
        return jsonify({"message": "Error occured", "reason": res.json().get("message")}), res.status_code
    
    return jsonify({"message": "Rating created/updated", "data": res.json()}), 200
