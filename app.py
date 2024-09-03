from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import requests
from xml.etree import ElementTree

app = Flask(__name__)
CORS(app)

# Set this to the URL of your ExistDB instance
# EXIST_DB_URL = "http://localhost:8080/exist/rest/db/apps/xcc-viewer/xml"
# AUTH = ('admin', 'test') 
EXIST_DB_URL = "https://alma-test.hadw-bw.de/exist/rest/db/alma/editions/ofr"
AUTH = ('alma', 'huhu') 
# EXIST_DB_USER = "admin" #alma
# EXIST_DB_PASSWORD = "test" #huhu


def parse_xml_files_list(xml_data):
    # Parses XML data to extract file names
    root = ElementTree.fromstring(xml_data)
    files = [elem.text for elem in root.findall('.//file')]
    return files

@app.route('/')
def index():
    return render_template('index.html') 

@app.route('/ccv')
def ccv():
    return render_template('4.html')


@app.route('/get-xml-files')
def get_xml_files():
    try:
        response = requests.get(f"{EXIST_DB_URL}/")
        if response.status_code == 200:
            xml_files = parse_xml_files_list(response.text)
            return jsonify(xml_files)
        else: 
            return jsonify({"error": "Failed to retrieve data"}), 500
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

@app.route('/xml/<path:filename>')
def serve_xml_file(filename):
    try:
        response = requests.get(f"{EXIST_DB_URL}/{filename}")
        if response.status_code == 200:
            return response.text
        else:
            return "File not found", 404
    except requests.RequestException as e:
        return str(e), 500

if __name__ == '__main__':
    app.run(debug=True)
