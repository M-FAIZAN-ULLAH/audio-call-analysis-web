# Import necessary packages
from flask import Flask, jsonify
from flask_cors import CORS

# Create a Flask application
app = Flask(__name__)

# Apply CORS to allow cross-origin requests
CORS(app)

# Define a route for the API


@app.route('/')
def hello():
    return jsonify({'message': 'Hello, World!'})

# Define a route with a custom endpoint


@app.route('/custom')
def custom():
    return jsonify({'message': 'This is a custom endpoint!'})


# Start the server on port 8000
if __name__ == '__main__':
    app.run(port=8000)
