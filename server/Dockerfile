FROM python:3.13-alpine

WORKDIR /server

RUN apk add --no-cache linux-headers gcc musl-dev

COPY . .
# .env is not copied for some reason... (make sure to have one)
COPY .env .env

RUN pip install -r requirements.txt

EXPOSE 8800

CMD ["python3", "app.py"]
