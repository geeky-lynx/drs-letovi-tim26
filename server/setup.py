from os import environ, getenv
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



_IS_DEV_STR = getenv("IS_DEV")
_SECRET_KEY = getenv("SECRET_KEY")
_DB_URI = getenv("SQLALCHEMY_DATABASE_URI")

# Stop the program if there are no config parameters
if _SECRET_KEY is None:
    print("SECRET_KEY == None! Can\'t proceed with running Flask instance")
    exit(2)

if _DB_URI is None:
    print("DB_URI == None! Can\'t proceed with running Flask instance")
    exit(2)



IS_DEV = True if _IS_DEV_STR is str and _IS_DEV_STR.lower() in ["1", "true"] else False
SECRET_KEY: str = _SECRET_KEY
DB_URI: str = _DB_URI
# User can't login for given amount of seconds if all attempts've been used
LOGIN_TIMEOUT_SECONDS = 60 if IS_DEV else 900



app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = DB_URI
app.secret_key = SECRET_KEY



class DbBase(DeclarativeBase):
    pass



db = SQLAlchemy(app, model_class = DbBase)
SALT = bcrypt.gensalt()
