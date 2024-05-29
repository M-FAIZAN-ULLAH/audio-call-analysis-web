# Import necessary packages
from flask import Flask, request, jsonify
from flask_cors import CORS
from hume import HumeBatchClient
from hume.models.config import ProsodyConfig
import json

# Create a Flask application
app = Flask(__name__)

# Apply CORS to allow cross-origin requests
CORS(app)


# HUME_API_KEY = "Aw8WEkvPYENhoiGjZ3hA4MbiuJGGfs6E5aGQKSRFH0zMcK7ll1mo8u1JLNdynG7N"

HUME_API_KEY = "tU7rsK37ybnJxvRF3h5uUNMwNpAnaamXBOpRQCtm1MkVuV93"


def process_mp3(file_path):
    try:
        # Initialize the Hume client
        client = HumeBatchClient(HUME_API_KEY)

        # Define the Hume config for processing the MP3 file
        config = ProsodyConfig()

        # Submit the MP3 file to Hume for processing
        urls = [file_path]  # Provide the file path as a URL
        job = client.submit_job(urls, [config])

        # Wait for the job to complete
        job.await_complete()

        # Download the predictions
        job.download_predictions("predictions.json")

        with open("predictions.json", "r") as file:
            predictions = json.load(file)

        return predictions

    except Exception as e:
        return {'message': f'Error processing file: {str(e)}'}


@app.route('/upload', methods=['POST'])
def upload_file():
    try:

        data = request.json
        url = data.get('url', '')
        # url = "https://res.cloudinary.com/dczyj0axu/video/upload/v1703717874/Fiver/cefsvhmbbactonxmw2cz.mp3"
        result = process_mp3(str(url))

        return jsonify(result)
        # return jsonify(url)

    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'})


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
