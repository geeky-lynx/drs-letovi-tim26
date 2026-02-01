from setup import app, db
import routes # This adds routes to `setup.app` (Flask instance)



if "__main__" == __name__:
    with app.app_context():
        db.create_all()
    app.run(port = 8800, debug = True)