FROM python:3.12-slim

WORKDIR /jobs

COPY ./requirements.txt /jobs/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /jobs/requirements.txt

COPY . /jobs

CMD ["fastapi", "run", "main.py", "--port", "80"]