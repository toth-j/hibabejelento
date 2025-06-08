# API végpontok

## 🎯 Általános API információk

* **API alap URL:** `/api`

* **Hitelesítés:**
  
  * A **/register** és **/login** végpont kivételével **minden végpont** JWT-t igényel.
  
  * Token: `Authorization: Bearer <token>` header-ben.

* * *

## 🎯Összefoglaló

| Végpont                      | Leírás                                                         |
| ---------------------------- | -------------------------------------------------------------- |
| POST `/api/login`            | Bejelentkezés, JWT token generálása                            |
| GET `/api/profil`            | Saját felhasználói adatok lekérdezése                          |
| GET `/api/hibak`             | Hibák listázása                                                |
| POST `/api/hibak`            | Új hiba bejelentése (csak tanároknak)                          |
| GET `/api/felhasznalok`      | Felhasználók listázása (csak admin)                            |
| PUT `/api/hibak/:id/javitas` | Hiba kijavítottra állítása (karbantartó/admin)                 |

* * *

## 🎯 ## Részletezés

* * *

1️⃣ POST `/api/login`
------------------------

### Leírás

Bejelentkezés és JWT token generálás.

### Kérés body

    {
      "felhasznalonev": "kissp",
      "jelszo": "jelszo123"
    }

### Válasz

* **200 OK**
    {
  
      "token": "<JWT-token>"
  
    }

* **401 Unauthorized** – hibás felhasználónév vagy jelszó.

* * *

2️⃣ GET `/api/profil`
------------------------

### Leírás

A bejelentkezett felhasználó adatainak lekérdezése.

### Válasz

    {
      "id": 1,
      "nev": "Kiss Péter",
      "felhasznalonev": "kissp",
      "szerep": "tanar"
    }

* * *

3️⃣ GET `/api/hibak`
-----------------------

### Leírás

A hibák listázása.

### Lekérdezési paraméterek (opcionális)

* `allapot=bejelentve` – csak bejelentett hibák

* `allapot=kijavitva` – csak kijavított hibák

### Válasz

    [
      {
        "id": 1,
        "datum": "2025-06-01",
        "bejelento_id": 1,
        "terem": "101-es terem",
        "leiras": "Eltört egy szék.",
        "allapot": "bejelentve",
        "javito_id": null,
        "javitas_datuma": null
      },
      ...
    ]

* * *

4️⃣ POST `/api/hibak`
------------------------

### Leírás

Új hiba bejelentése (csak tanároknak és adminnak).

### Kérés body

    {
      "terem": "101-es terem",
      "leiras": "Eltört egy szék."
    }

### Automatikusan

* `datum`: mai dátum (YYYY-MM-DD).

* `bejelento_id`: JWT user id.

* `allapot`: `"bejelentve"`.

### Válasz

* **201 Created** – új hiba JSON.

* **403 Forbidden** – ha karbantartó próbál hibát bejelenteni.

* * *

5️⃣ GET `/api/felhasznalok`
-----------------------------

### Leírás

Az összes felhasználó listázása (csak admin).

### Válasz

* **200 OK** – felhasználók listája JSON.

    ```json
    [
      {
        "id": 1,
        "nev": "Adminisztrátor",
        "felhasznalonev": "admin",
        "szerep": "admin"
      },
      {
        "id": 2,
        "nev": "Kiss Péter",
        "felhasznalonev": "kissp",
        "szerep": "tanar"
      },
      ...
    ]
    ```

* **403 Forbidden** – ha nem admin próbálja lekérdezni.

* * *

6️⃣ PUT `/api/hibak/:id/javitas`
-----------------------------------

### Leírás

A hiba „kijavítva” állapotra állítása (csak karbantartó vagy admin).

### Kérés body

(nem szükséges, a backend tölti a javító és dátum mezőt)

### Automatikusan

* `allapot`: `"kijavitva"`.

* `javito_id`: JWT user id.

* `javitas_datuma`: mai dátum.

### Válasz

* **200 OK** – frissített hiba JSON.

* **403 Forbidden** – ha tanár próbálja javítani.

* **404 Not Found** – ha a megadott ID-val nem létezik hiba.

  ```json
  { "error": "A megadott ID-val nem létezik hiba." }
  ```

* **409 Conflict** – ha a hiba már "kijavítva" állapotban van.

* * *

🟩  Jogosultság összefoglaló
-------------------------------

| Végpont                      | Tanár            | Karbantartó | Admin |
| ---------------------------- | ---------------- | ----------- | ----- |
| POST `/api/login`            | ✅                | ✅           | ✅     |
| GET `/api/profil`            | ✅                | ✅           | ✅     |
| GET `/api/hibak`             | ✅                | ✅           | ✅     |
| POST `/api/hibak`            | ✅                | ❌           | ✅     |
| GET `/api/felhasznalok`      | ❌                | ❌           | ✅     |
| PUT `/api/hibak/:id/javitas` | ❌                | ✅           | ✅     |

* * *

🟩 Példa JWT tartalom
-------------------------

A JWT `payload` tartalmazhatja:
    {
      "id": 1,
      "felhasznalonev": "admin",
      "szerep": "admin"
    }

Így a könnyen ellenőrizhető, hogy ki a bejelentkezett felhasználó és milyen szerepköre van.

* * *

#
