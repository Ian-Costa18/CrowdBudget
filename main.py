from flask import Flask, request, jsonify, send_from_directory
from google.cloud import firestore


app = Flask(__name__)
db = firestore.Client.from_service_account_json('crowdbudget-a5991e488c95.json')

def get_budgets(location_id):
    location_ref = db.collection(u"locations")
    state = location_ref.document(location_id)
    budgets = state.collection(u"budgets")
    budget_lst = []
    for doc in budgets.stream():
        budget_lst.append(doc.to_dict())

    budget_items = {
        "Rent": [0, 0],
        "Bills": [0, 0],
        "Gas": [0, 0],
        "Groceries": [0, 0],
        "Loans": [0, 0],
        "Restaurants": [0, 0],
        "Lifestyle": [0, 0],
        "Savings": [0, 0],
        "Other": [0, 0]
    }

    for budget in budget_lst:
        for item in budget_items.keys():
            try:
                budget_items[item][0] += int(budget[item])
                budget_items[item][1] += 1
            except KeyError as e:
                print(f"No data for {item} in {location_id}")

    avg_budget = {
        "Rent": 0,
        "Bills": 0,
        "Gas": 0,
        "Groceries": 0,
        "Loans": 0,
        "Restaurants": 0,
        "Lifestyle": 0,
        "Savings": 0,
        "Other": 0
    }
    for key, value in budget_items.items():
        try:
            avg_budget[key] = int(value[0] // value[1])
        except ZeroDivisionError as e:
            print(f"No data for {key} in {location_id}")

    return avg_budget

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

@app.route("/map", methods=["GET"])
def map_page():
    return app.send_static_file("map.html")

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
        return jsonify(get_budgets(loc.upper()))

if __name__ == "__main__":
    app.run()

