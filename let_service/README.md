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
