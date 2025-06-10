## Hibabejelentő alkalmazás - Backend API dokumentáció

Ez a dokumentum a Hibabejelentő alkalmazás backend API végpontjait, azok működését, a szükséges authentikációt és a tesztelési folyamatot írja le.

### Tartalomjegyzék

- [1. Általános API információk](#1-általános-api-információk)
  - [1.1. Alap URL](#11-alap-url)
  - [1.2. Authentikáció](#12-authentikáció)
- [2. Végpontok összefoglalója](#2-végpontok-összefoglalója)
- [3. Végpontok részletezése](#3-végpontok-részletezése)
  - [3.1. Felhasználói fiók kezelése](#31-felhasználói-fiók-kezelése)
    - [3.1.1. `POST /api/login` - Bejelentkezés](#311-post-apilogin---bejelentkezés)
    - [3.1.2. `GET /api/profil` - Profiladatok lekérdezése](#312-get-apiprofil---profiladatok-lekérdezése)
    - [3.1.3. `GET /api/felhasznalok` - Felhasználók listázása](#313-get-apifelhasznalok---felhasználók-listázása)
    - [3.1.4. `POST /api/felhasznalok` - Új felhasználó létrehozása](#314-post-apifelhasznalok---új-felhasználó-létrehozása)
    - [3.1.5. `DELETE /api/felhasznalok/:id` - Felhasználó törlése](#315-delete-apifelhasznalokid---felhasználó-törlése)
  - [3.2. Hibabejelentések kezelése](#32-hibabejelentések-kezelése)
    - [3.2.1. `GET /api/hibak` - Hibák listázása](#321-get-apihibak---hibák-listázása)
    - [3.2.2. `POST /api/hibak` - Új hiba bejelentése](#322-post-apihibak---új-hiba-bejelentése)
    - [3.2.3. `PUT /api/hibak/:id/javitas` - Hiba kijavítottra állítása](#323-put-apihibakidjavitas---hiba-kijavítottra-állítása)
- [4. Jogosultság összefoglaló](#4-jogosultság-összefoglaló)
- [5. Példa JWT tartalom](#5-példa-jwt-tartalom)
- [6. Tesztelés](#6-tesztelés)
  - [6.1. Tesztadatok előkészítése](#61-tesztadatok-előkészítése)

---

## 1. Általános API információk

### 1.1. Alap URL

Minden API hívás a `/api` végponton keresztül történik. A teljes URL a szerver konfigurációjától függ (pl. `http://localhost:3000/api`).

### 1.2. Authentikáció

A `/api/login` végpont kivételével minden más API végpont JWT (JSON Web Token) alapú authentikációt igényel.
A sikeres bejelentkezés után kapott tokent minden védett kérés `Authorization` fejlécében kell elküldeni, `Bearer <token>` formátumban.

---

## 2. Végpontok összefoglalója

| HTTP Metódus | Végpont                      | Leírás                                                         | Authentikáció | Jogosultság         |
|--------------|------------------------------|----------------------------------------------------------------|---------------|---------------------|
| `POST`       | `/api/login`                 | Bejelentkezés, JWT token generálása.                           | Nem szükséges | -                   |
| `GET`        | `/api/profil`                | Saját felhasználói adatok lekérdezése.                         | Szükséges     | Bármely bejelentkezett |
| `GET`        | `/api/hibak`                 | Hibák listázása, opcionális szűréssel állapot szerint.         | Szükséges     | Bármely bejelentkezett |
| `POST`       | `/api/hibak`                 | Új hiba bejelentése.                                           | Szükséges     | `tanar`, `admin`    |
| `GET`        | `/api/felhasznalok`          | Összes felhasználó listázása (jelszó nélkül).                  | Szükséges     | Bármely bejelentkezett |
| `POST`       | `/api/felhasznalok`          | Új felhasználó létrehozása.                                    | Szükséges     | `admin`             |
| `DELETE`     | `/api/felhasznalok/:id`      | Felhasználó törlése azonosító alapján.                          | Szükséges     | `admin`             |
| `PUT`        | `/api/hibak/:id/javitas`     | Hiba kijavítottra állítása.                                    | Szükséges     | `karbantarto`, `admin` |

---

## 3. Végpontok részletezése

### 3.1. Felhasználói fiók kezelése

#### 3.1.1. `POST /api/login` - Bejelentkezés

- **Leírás:** Felhasználó bejelentkeztetése és JWT token generálása.
- **Kérés törzse (Request Body):**

    ```json
    {
      "felhasznalonev": "felhasznalo_neve",
      "jelszo": "jelszava"
    }
    ```

- **Sikeres válasz (200 OK):**

    ```json
    {
      "token": "generalt_jwt_token"
    }
    ```

- **Hiba válaszok:**
  - `400 Bad Request`: `{ "error": "Felhasználónév és jelszó megadása kötelező." }`
  - `401 Unauthorized`: `{ "error": "Hibás felhasználónév vagy jelszó." }`
  - `500 Internal Server Error`: `{ "error": "Szerverhiba történt a bejelentkezés során." }`

#### 3.1.2. `GET /api/profil` - Profiladatok lekérdezése

- **Leírás:** A bejelentkezett felhasználó adatainak lekérdezése.
- **Sikeres válasz (200 OK):**

    ```json
    {
      "id": 1,
      "nev": "Felhasználó Neve",
      "felhasznalonev": "felhasznalo_neve",
      "szerep": "tanar"
    }
    ```

- **Hiba válaszok:**
  - `401 Unauthorized`: `{ "error": "Hiányzó vagy érvénytelen token." }`
  - `403 Forbidden`: `{ "error": "Érvénytelen token vagy lejárt munkamenet." }`
  - `404 Not Found`: `{ "error": "Felhasználó nem található." }`
  - `500 Internal Server Error`: `{ "error": "Szerverhiba történt a profiladatok lekérdezése során." }`

#### 3.1.3. `GET /api/felhasznalok` - Felhasználók listázása

- **Leírás:** Az összes regisztrált felhasználó adatainak listázása (jelszó nélkül).
- **Sikeres válasz (200 OK):**

    ```json
    [
      { "id": 1, "nev": "Admin", "felhasznalonev": "admin", "szerep": "admin" },
      { "id": 2, "nev": "Kiss Péter", "felhasznalonev": "kissp", "szerep": "tanar" }
    ]
    ```

- **Hiba válaszok:**
  - `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`.

#### 3.1.4. `POST /api/felhasznalok` - Új felhasználó létrehozása

- **Leírás:** Új felhasználó létrehozása. Csak `admin` szerepkörű felhasználók számára.
- **Kérés törzse:**

    ```json
    {
      "nev": "Új Teszt Felhasználó",
      "felhasznalonev": "ujteszt",
      "jelszo": "Jelszo123!",
      "szerep": "tanar" /* Lehetséges: admin, tanar, karbantarto */
    }
    ```

- **Sikeres válasz (201 Created):**

    ```json
    { "id": 7, "nev": "Új Teszt Felhasználó", "felhasznalonev": "ujteszt", "szerep": "tanar" }
    ```

- **Hiba válaszok:**
  - `400 Bad Request`: Hiányzó mezők vagy érvénytelen szerepkör.
  - `403 Forbidden`: Jogosultság hiánya.
  - `409 Conflict`: Felhasználónév már foglalt.
  - `401 Unauthorized`, `500 Internal Server Error`.

#### 3.1.5. `DELETE /api/felhasznalok/:id` - Felhasználó törlése

- **Leírás:** Felhasználó törlése azonosító alapján. Csak `admin` szerepkörű felhasználók számára. Adminisztrátor nem törölheti saját magát.
- **Útvonal paraméter:** `id` (integer) - A törlendő felhasználó azonosítója.
- **Sikeres válasz (200 OK):**

    ```json
    { "message": "A(z) <id> azonosítójú felhasználó sikeresen törölve." }
    ```

- **Hiba válaszok:**
  - `400 Bad Request`: Érvénytelen ID, vagy admin próbálja magát törölni.
  - `403 Forbidden`: Jogosultság hiánya.
  - `404 Not Found`: Felhasználó nem található.
  - `409 Conflict`: Felhasználó nem törölhető (pl. kapcsolódó hibabejegyzések miatt - FOREIGN KEY constraint).
  - `401 Unauthorized`, `500 Internal Server Error`.

### 3.2. Hibabejelentések kezelése

#### 3.2.1. `GET /api/hibak` - Hibák listázása

- **Leírás:** Hibabejelentések listázása.
- **Lekérdezési paraméter (Query Parameter - opcionális):**
  - `allapot`: Szűrés állapot szerint (`bejelentve` vagy `kijavítva`).
- **Sikeres válasz (200 OK):**

    ```json
    [
      {
        "id": 1,
        "datum": "2023-10-26",
        "bejelento_id": 2,
        "terem": "101-es terem",
        "leiras": "Projektor nem működik",
        "allapot": "bejelentve",
        "javito_id": null,
        "javitas_datuma": null
      }
    ]
    ```

- **Hiba válaszok:**
  - `400 Bad Request`: Érvénytelen `allapot` paraméter.
  - `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`.

#### 3.2.2. `POST /api/hibak` - Új hiba bejelentése

- **Leírás:** Új hiba bejelentése. Csak `tanar` vagy `admin` szerepkörű felhasználók számára.
- **Kérés törzse:**

    ```json
    {
      "terem": "Folyosó A",
      "leiras": "Kiégett egy villanykörte"
    }
    ```

- **Sikeres válasz (201 Created):** A létrehozott hiba objektuma.

- **Hiba válaszok:**
  - `400 Bad Request`: Hiányzó `terem` vagy `leiras`.
  - `403 Forbidden`: Jogosultság hiánya.
  - `401 Unauthorized`, `500 Internal Server Error`.

#### 3.2.3. `PUT /api/hibak/:id/javitas` - Hiba kijavítottra állítása

- **Leírás:** Hiba állapotának "kijavítva"-ra állítása. Csak `karbantarto` vagy `admin` szerepkörű felhasználók számára.
- **Útvonal paraméter:** `id` (integer) - A javítandó hiba azonosítója.
- **Sikeres válasz (200 OK):** A frissített hiba objektuma.
- **Hiba válaszok:**
  - `403 Forbidden`: Jogosultság hiánya.
  - `404 Not Found`: Hiba nem található.
  - `409 Conflict`: A hiba már ki van javítva.
  - `401 Unauthorized`, `500 Internal Server Error`.

---

## 4. Jogosultság összefoglaló

| Végpont                      | Tanár | Karbantartó | Admin |
| :--------------------------- | :---: | :---------: | :---: |
| `POST /api/login`            | ✅    | ✅          | ✅    |
| `GET /api/profil`            | ✅    | ✅          | ✅    |
| `GET /api/hibak`             | ✅    | ✅          | ✅    |
| `POST /api/hibak`            | ✅    | ❌          | ✅    |
| `GET /api/felhasznalok`      | ✅    | ✅          | ✅    |
| `POST /api/felhasznalok`     | ❌    | ❌          | ✅    |
| `DELETE /api/felhasznalok/:id`| ❌   | ❌          | ✅    |
| `PUT /api/hibak/:id/javitas` | ❌    | ✅          | ✅    |

---

## 5. Példa JWT tartalom

A generált JWT token payload-ja a következő adatokat tartalmazza:

```json
{
  "id": 1,
  "felhasznalonev": "admin",
  "szerep": "admin",
  "iat": 1678886400, // Kiállítás időpontja (timestamp)
  "exp": 1678890000  // Lejárat időpontja (timestamp)
}
```

---

## 6. Tesztelés

A backend API végpontjainak tesztelése a `tests/api_test.http` fájl segítségével történik. Ez a fájl a VS Code REST Client kiterjesztésével (vagy hasonló eszközzel) használható HTTP kérések küldésére és a válaszok ellenőrzésére.

Minden teszteset a `.http` fájlban tartalmazza a várt HTTP státuszkódot és egy rövid leírást a teszt céljáról.

### 6.1. Tesztadatok előkészítése

A teszteléshez és a fejlesztéshez szükséges alap adatbázis séma és kezdeti adatok a projekt gyökérkönyvtárában található `tesztadatok.sql` fájlban definiáltak.

Az adatbázis (alapértelmezetten `hibabejelento.db`) létrehozásához és a tesztadatokkal való feltöltéséhez futtasd a következő parancsot a projekt gyökérkönyvtárából (feltéve, hogy az SQLite CLI telepítve van és elérhető a PATH-ban):

```bash
sqlite3 hibabejelento.db < tesztadatok.sql
```

Ez a parancs létrehozza (ha nem létezik) a `hibabejelento.db` fájlt, végrehajtja a `tesztadatok.sql`-ben lévő `CREATE TABLE` utasításokat, majd feltölti a táblákat az `INSERT INTO` utasításokkal. A `server.js` indításkor szintén ellenőrzi és létrehozza a táblákat, ha azok nem léteznek, de a tesztadatokat az SQL szkript tölti fel.

* * *
