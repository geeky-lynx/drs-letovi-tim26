import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

if not load_dotenv():
    print("Error while loading .env variables")
    exit(2)


def env(key: str, default=None):
    val = os.getenv(key)
    return default if val is None or val == '' else val


class Config:
    SECRET_KEY = env('LET_SECRET_KEY', 'dev-secret')

    # MySQL (DB2)
    _explicit_db_uri = env('LET_SQLALCHEMY_DATABASE_URI', None)
    if _explicit_db_uri:
        SQLALCHEMY_DATABASE_URI = _explicit_db_uri
    else:
        _db_user = env('LET_DB_USER', 'root')
        _db_password = env('LET_DB_PASSWORD', '')
        _db_host = env('LET_DB_HOST', '127.0.0.1')
        _db_port = env('LET_DB_PORT', '3306')
        _db_name = env('LET_DB_NAME', 'let_service')

        _pw = quote_plus(_db_password) if _db_password is not None else ''
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{_db_user}:{_pw}@{_db_host}:{_db_port}/{_db_name}?charset=utf8mb4"
        )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False

    # Async purchase simulation
    PURCHASE_PROCESSING_SECONDS = float(env('LET_PURCHASE_PROCESSING_SECONDS', '2.0'))

    # Role enforcement
    ENFORCE_ROLES = str(env('LET_ENFORCE_ROLES', 'false')).lower() in ('1','true','yes','y')
