# Hibabejelentő

## Vizsgaremek (2025. május)

Iskolánk portáján van egy füzet. Ebbe írják be a tanárok az iskolában észlelt hibákat, amelyeket utána a karbantartók kijavítanak.

A projekt célja a portán lévő füzet kiváltása egy webes felületű hibabejelentő és -nyilvántartó rendszerrel, amely számítógépről és mobilról egyaránt elérhető.

Az adatokat egy adatbázisban kell tárolni, amelyet egy API-n keresztül lehet elérni. Az elkészített alkalmazás erről az API-ról tölti le és jeleníti meg az adatokat.

* * *

## Telepítés és futtatás

### Szükséges szoftverek

* Node.js (LTS verzió ajánlott)
* npm (Node.js-sel együtt települ)

### Konfiguráció

1. Klónozd a projekt repository-t.

2. Navigálj a projekt gyökérkönyvtárába.

3. Hozz létre egy `.env` fájlt a gyökérkönyvtárban a következő tartalommal (Cseréld le a `JWT_SECRET` értékét egy titkos kulcsra):
   
   ```
   JWT_SECRET=generalt_eros_titkos_kulcs_legyen_itt
   DB_PATH=./hibabejelento.db
   PORT=3000
   ```

4. Telepítsd a függőségeket: `npm install`

5. Hozz létre felhasználókat az adatbázisban. ezt  alegegyszerűbbe a `tesztadatok.sql` fájlban lévő parancsok futtatásával tudod megtenni:

   `sqlite3 hibabejelento.db < tesztadatok.sql`

   A tesztadatokban nem csak felhasználók vannak, hanem néhány bekelentett/kijavított hiba is a teszteléshez.

### Indítás

* A szerver indítása: `npm start` vagy `node server.js`
* Az alkalmazás elérhető lesz a `http://localhost:5000` címen).

## Dokumentáció

* A specifikáció, valamint az adatbázis, a frontend és a backend dokumentációja a [docs mappában](docs) található.

## Tesztelés

* A manuális teszteket a [tests mappában](tests) találod.
