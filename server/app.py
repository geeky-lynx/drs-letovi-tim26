from datetime import datetime
from typing import Optional
from flask import Flask, request, session, flash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import DateTime, Float, String, Integer
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
    
    id: Mapped[int]                        = mapped_column(Integer, primary_key = True)
    email: Mapped[str]                     = mapped_column(String(50), unique = True, nullable = False)
    password: Mapped[str]                  = mapped_column(String(500), nullable = False)
    role: Mapped[str]                      = mapped_column(String(8), nullable = False) # USER | MANAGER | ADMIN
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



# TODO: Change responses
@app.route("/login", methods = ["POST"])
def user_login():
    if "user" in session and session["user"] != "":
        return "Already logged in"
    
    if request.method != "POST":
        return "Invalid HTTP method"
        
    user_email = request.form["email"]
    unhashed_password = request.form["password"]

    is_email_empty = user_email is None or user_email == ""
    is_password_empty = unhashed_password is None or unhashed_password == ""
    if (is_email_empty or is_password_empty):
        return "Invalid form request"
        
    hashed_password = bcrypt.hashpw(unhashed_password.encode("utf-8"), SALT)
        
    query = User.query.filter_by(email = user_email).first()
    if query is None or query.password == hashed_password:
        flash("Invalid email or password (or this account doesn\'t exist)", "error")
        return "Invalid email or password (or this account doesn\'t exist)"
    
    session["user"] = user_email
    return "Successfully logged in"



@app.route("/register", methods = ["POST"])
def user_register():
    if "user" in session and session["user"] != "":
        return "Logged in; must logout first"
    
    if request.method != "POST":
        return "Invalid HTTP method"
        
    user_email = request.form["email"]
    unhashed_password = request.form["password"]
    repeated_password = request.form["password_repeated"]

    is_email_empty = user_email is None or user_email == ""
    is_password_empty = unhashed_password is None or unhashed_password == ""
    is_repeated_empty = repeated_password is None or repeated_password == ""
    if (is_email_empty or is_password_empty or is_repeated_empty):
        return "Invalid form request"
        
    old_user = User.query.filter_by(email = user_email).first()
    if old_user != None:
        return "User with that email already exists"
        
    if unhashed_password != repeated_password:
        flash("Passwords don\'t match", "error")
        return "Passwords don\'t match"
        
    hashed_password = bcrypt.hashpw(unhashed_password.encode("utf-8"), SALT)
    role = request.form["role"] if "role" in request.form else "USER"
    first_name = request.form["first_name"]
    last_name = request.form["last_name"]
    birth_date = request.form["birth_date"]
    gender = request.form["gender"]
    country = request.form["country"]
    street = request.form["street"]
    
    # TODO: Add DB query to add and handle errors
    
    return "TODO: Implement"



if "__main__" == __name__:
    with app.app_context():
        db.create_all()
    app.run(port = 8800, debug = True)