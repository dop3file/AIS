import subprocess
from subprocess import run

query = """
curl -X 'POST' \
        'http://0.0.0.0:8000/api/v1/zones/' \
        -H 'accept: application/json' \
        -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtZXJsaW5pbmNvcnBAZ21haWwuY29tIiwiZXhwIjoxNzY1MTc3MDY0fQ.SVOtgU9hvKPkmPYvZQ9dDEPNNDyxrLhygHGPtj5FsHI' \
        -H 'Content-Type: application/json' \
        -d \'{
        "name": "{name}",
        "description": "{description}",
        "location": "{location}"
        }\'
"""

for i in range(1_000_000):
    subprocess.run(
        query.format(name=str(i), description=str(i), location=str(i))
    )