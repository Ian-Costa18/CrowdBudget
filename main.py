from flask import Flask, request, jsonify, send_from_directory
from google.cloud import firestore
from os import getcwd


app = Flask(__name__)
db = firestore.Client.from_service_account_json('crowdbudget-a5991e488c95.json')

def get_budgets(location_id):
    location_ref = db.collection(u"locations")
    state = location_ref.document(location_id)
    budgets = state.collection(u"budgets")
    budget_lst = []
    for doc in budgets.stream():
        budget_lst.append(doc.to_dict())
    return budget_lst

def add_to_db(state, data):
    state = db.collection(u"locations").document(state)
    if not state.get().exists:
        return 1
    budgets = state.collection(u"budgets")

    budgets.add(data)
    return 0


@app.route("/", methods=["GET"])
def main_page():
    return app.send_static_file("main_page.html")

@app.route("/submit", methods=["POST"])
def submit():
    if request.method == "POST":
        args = request.values
        test = add_to_db(args["state"], args)
        if test == 1:
            return "Failed, invalid state."
        return "Success?"

    return "Not a post :("

@app.route("/budgets", methods=["GET"])
def budget_api():
    if request.method == "GET":
        loc = str(request.args.get("location"))
        return jsonify(get_budgets(loc))

if __name__ == "__main__":
    app.run()

