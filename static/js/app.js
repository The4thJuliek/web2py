// app.js content
function validateXML(docName) {
    fetch('/validate-xml', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xmlName: docName }),
    })
    .then(response => response.json())
    .then(data => {
        alert(`Validation result for ${docName}: ${data.result}`);
    })
    .catch(error => console.error('Error:', error));
}