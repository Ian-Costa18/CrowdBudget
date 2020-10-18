from flask import Flask, request
from google.cloud import firestore


app = Flask(__name__)
db = firestore.Client.from_service_account_json('crowdbudget-a5991e488c95.json')

def get_budgets(location_id):
    location_ref = db.collection(u"locations")
    state = location_ref.document(location_id)
    budgets = state.collection(u"budgets")
    for doc in budgets.stream():
        print(f"{doc.id}: {doc.to_dict()}")


@app.route("/", methods=["GET", "POST"])
def main_page():
    if request.method == "POST":
        return request.values.get("name")

    return "Hello World!\nNot a post :("

if __name__ == "__main__":
    get_budgets("RI")
    #app.run()

