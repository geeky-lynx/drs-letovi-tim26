from os import getenv
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
import bcrypt



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

