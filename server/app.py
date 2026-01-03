from flask import Flask, request



app = Flask(__name__)



@app.route("/ping-reachable")
def ping_reachable():
    return "<p>Server is reachable</p>"
