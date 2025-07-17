# SQLite adatbázis

* * *

### **Táblák**

#### 1️⃣ **Felhasználók (`felhasznalok`)**

| Oszlop neve      | Típus       | Leírás                             |
| ---------------- | ----------- | ---------------------------------- |
| `id`             | INTEGER     | Elsődleges kulcs (auto increment). |
| `nev`            | TEXT        | Felhasználó teljes neve.           |
| `felhasznalonev` | TEXT UNIQUE | Egyedi bejelentkezési név.         |
| `jelszo`         | TEXT        | Jelszó (hash-elt).                 |
| `szerep`         | TEXT        | `tanar` vagy `karbantarto`.        |

* * *

#### 2️⃣ **Hibabejelentések (`hibak`)**

| Oszlop neve      | Típus   | Leírás                                                                         |
| ---------------- | ------- | ------------------------------------------------------------------------------ |
| `id`             | INTEGER | Elsődleges kulcs (auto increment).                                             |
| `datum`          | TEXT    | Dátum ISO formátumban (pl. 2025-06-02).                                        |
| `bejelento_id`   | INTEGER | A bejelentő felhasználó azonosítója (foreign key `felhasznalok.id`).           |
| `terem`          | TEXT    | Terem megnevezése (szöveg).                                                    |
| `leiras`         | TEXT    | Hiba rövid leírása.                                                            |
| `allapot`        | TEXT    | `bejelentve` vagy `kijavitva`.                                                 |
| `javito_id`      | INTEGER | Karbantartó azonosítója (`felhasznalok.id`), ha javítva van. NULL, ha még nem. |
| `javitas_datuma` | TEXT    | Javítás dátuma ISO formátumban. NULL, ha még nem javították.                   |

* * *

### **Kapcsolatok**

* `bejelento_id` → `felhasznalok.id` (ki jelentette be).

* `javito_id` → `felhasznalok.id` (ki javította meg).

* * *

### **SQLite DDL parancsok**

    -- Felhasználók tábla
    CREATE TABLE felhasznalok (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nev TEXT NOT NULL,
      felhasznalonev TEXT UNIQUE NOT NULL,
      jelszo TEXT NOT NULL,
      szerep TEXT NOT NULL
    );
    
    -- Hibabejelentések tábla
    CREATE TABLE hibak (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datum TEXT NOT NULL,
      bejelento_id INTEGER NOT NULL,
      terem TEXT NOT NULL,
      leiras TEXT NOT NULL,
      allapot TEXT NOT NULL,
      javito_id INTEGER,
      javitas_datuma TEXT,
      FOREIGN KEY (bejelento_id) REFERENCES felhasznalok(id),
      FOREIGN KEY (javito_id) REFERENCES felhasznalok(id)
    );

* * 

## Tesztadatok

### **1️⃣ Felhasználók (`felhasznalok`)**

    INSERT INTO felhasznalok (nev, felhasznalonev, jelszo, szerep) VALUES
      ('Admin, 'admin', '$2b$10$g/TzyDNKvf1jkQWr5dVwZ.0ieBAIXALgKa31A7IA4Xtomi7m4ZC1G', 'admin'),
      ('Kiss Péter', 'kissp', '$2b$10$A8y5my3gqHwIXaxs4ryt8eZeBxWeD1Qc2G/VrKQgIIeng5ByRcTpG', 'tanar'),
      ('Nagy Anna', 'nagya', '$2b$10$SGUiT22WyyPv8CuQ4ed/QOzWqtDlDdYWRPHoBGOUGXtqEnGpC5g8i', 'tanar'),
      ('Szabó Béla', 'szabob', '$2b$10$.BDU2ItscPaZ3vlkK8Rw1eemnqaMIUbo.xJ9sHSlx1takeGxpAyYu', 'karbantarto'),
      ('Tóth Károly', 'tothk', '$2b$10$gVPZD2F.4A4knDzo8ySoJuOBRBdxi4dxFn3M2K1CsQ6fMXZqQPYom', 'karbantarto');

(A hash-elt jelszavakat a hash.js program futtatásával állítottuk elő.)

* * *

### **2️⃣ Hibák (`hibak`)**

    INSERT INTO hibak (datum, bejelento_id, terem, leiras, allapot, javito_id, javitas_datuma) VALUES
      ('2025-06-01', 1, '101-es terem', 'Eltört egy szék.', 'bejelentve', NULL, NULL),
      ('2025-06-01', 2, 'Folyosó', 'A folyosón nem ég a lámpa.', 'bejelentve', NULL, NULL),
      ('2025-05-30', 1, '201-es terem', 'A projektor nem működik.', 'kijavítva', 3, '2025-05-31'),
      ('2025-05-28', 2, 'Tanári', 'Csöpög a csap.', 'kijavítva', 4, '2025-05-29'),
      ('2025-06-02', 1, 'Könyvtár', 'Eltört polc.', 'bejelentve', NULL, NULL);

* * *

Ezekkel a tesztadatokkal lehet tesztelni:

* Lekérdezni a „bejelentve” állapotú hibákat.

* Listázni a karbantartó által javított hibákat.

* Szűrni a termek vagy bejelentők szerint.

Új tesztadatbázis létrehozásához a parancsok a *tesztadatok.sql* fájlba kerültek. Futtatás:

`sqlite3 hibabejelento.db < tests/tesztadatok.sql`
