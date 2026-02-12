# let_service

`let_service` je mikroservis zadužen za upravljanje avio-kompanijama, letovima i kupovinom karata.  
Servis omogućava kreiranje letova, administrativno odobravanje, asinhronu kupovinu karata i ocenjivanje letova nakon završetka.

---

## Pokretanje servisa

### 1. Kreiranje i aktivacija virtualnog okruženja

```bash
python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

U folderu let_service kreirati .env fajl sa MySQL parametrima:

LET_DB_HOST=127.0.0.1
LET_DB_PORT=3306
LET_DB_NAME=let_service
LET_DB_USER=let_user
LET_DB_PASSWORD=your_password

python -m let_service

Servis se pokreće na adresi:
http://127.0.0.1:8801

## Podešavanje MySQL baze (drugi računar)

1. Pokrenuti MySQL Server (servis mora biti aktivan).
2. U MySQL Workbench-u ili MySQL konzoli napraviti bazu i korisnika:

```sql
CREATE DATABASE let_service;
CREATE USER 'let_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON let_service.* TO 'let_user'@'localhost';
FLUSH PRIVILEGES;

U .env fajlu u let_service folderu upisati iste podatke:

LET_DB_HOST=127.0.0.1
LET_DB_PORT=3306
LET_DB_NAME=let_service
LET_DB_USER=let_user
LET_DB_PASSWORD=your_password

#komande za testiranje u terminalu za svaki slucaj:

Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8801/airlines" -ContentType "application/json" -Body '{"name":"Air Serbia"}'

Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8801/flights" -ContentType "application/json" -Headers @{ "X-User-Id"="10"; "X-User-Role"="MANAGER" } -Body '{"name":"BGD-ZRH DEMO","airline_id":1,"distance_km":950,"duration_seconds":120,"departure_time":"2026-12-17T20:00:00","origin_airport":"BEG","destination_airport":"ZRH","created_by":"manager10","price":199.99}'

Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:8801/flights?tab=pending"

Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8801/flights/1/approve" -Headers @{ "X-User-Id"="1"; "X-User-Role"="ADMIN" }

Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:8801/flights?tab=upcoming"

Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8801/purchases" -ContentType "application/json" -Headers @{ "X-User-Id"="99"; "X-User-Role"="USER" } -Body '{"flight_id":1}'

Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:8801/users/99/purchases"

Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:8801/flights/1/buyers"

