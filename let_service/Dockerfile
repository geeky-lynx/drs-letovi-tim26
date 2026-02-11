FROM python:3.13-alpine

WORKDIR /let_service

RUN apk add --no-cache linux-headers gcc musl-dev

COPY . .
# .env is not copied for some reason... (make sure to have one)
COPY ./let_service/.env ./let_service/.env

RUN pip install -r requirements-let-service.txt

EXPOSE 8801

CMD ["python3", "-m", "let_service"]
