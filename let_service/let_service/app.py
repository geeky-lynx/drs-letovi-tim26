from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()

from dotenv import load_dotenv
from flask import Flask, jsonify

from .config import Config
from .db import db
from .api import api


def create_app() -> Flask:

    load_dotenv(override=False)

    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    @app.get("/ping")
    def ping():
        return jsonify({"ok": True, "service": "let_service"})

    app.register_blueprint(api)

    with app.app_context():
        db.create_all()

    return app


def main() -> None:
    app = create_app()
    app.run(host="0.0.0.0", port=8801, debug=True)


if __name__ == "__main__":
    main()
