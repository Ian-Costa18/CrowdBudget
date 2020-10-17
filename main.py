from flask import Flask, request


app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def main_page():
    if request.method == "POST":
        return request.values.get("name")

    return "Hello World!\nNot a post :("

if __name__ == "__main__":
    app.run()
