from flask import Flask, request

from server.env_loader import load_local_env



local_env = dict()
try:
    local_env = load_local_env()
except Exception as error:
    print("Error occured")
    print(f"{error}")

app = Flask(__name__)



@app.route("/ping-reachable")
def ping_reachable():
    return "<p>Server is reachable</p>"
