from flask import Blueprint

api = Blueprint("api", __name__)

from . import airlines, flights, purchases, ratings  # noqa: E402,F401
