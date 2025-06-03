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
| POST `/api/register`         | Felhasználó regisztrálása (admin által)                        |
| POST `/api/login`            | Bejelentkezés, JWT token generálása                            |
| GET `/api/profil`            | Saját felhasználói adatok lekérdezése                          |
| GET `/api/hibak`             | Hibák listázása                                                |
| GET `/api/hibak/:id`         | Egyedi hiba adatainak lekérdezése                              |
| POST `/api/hibak`            | Új hiba bejelentése (csak tanároknak)                          |
| PUT `/api/hibak/:id`         | Hiba adatainak szerkesztése (bejelentő/admin, ha „bejelentve”) |
| PUT `/api/hibak/:id/javitas` | Hiba kijavítottra állítása (karbantartó/admin)                 |

* * *

## 🎯 ## Részletezés

* * *

1️⃣ POST `/api/register`
---------------------------

### Leírás

Új felhasználó regisztrálása (csak admin).

### Kérés body

    {
      "nev": "Kiss Péter",
      "felhasznalonev": "kissp",
      "jelszo": "jelszo123",
      "szerep": "tanar"    // lehet: "tanar", "karbantarto", "admin"
    }

### Válasz

* **201 Created** – új felhasználó JSON adatai (id, nev, felhasznalonev, szerep).

* **400 Bad Request** – hiányzó vagy érvénytelen mező.

* **409 Conflict** – a megadott felhasználónév már létezik.

* **403 Forbidden** – ha nem admin próbál regisztrálni.

* * *

2️⃣ POST `/api/login`
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

3️⃣ GET `/api/profil`
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

4️⃣ GET `/api/hibak`
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

5️⃣ GET `/api/hibak/:id`
---------------------------

### Leírás

Egyedi hibabejelentés adatainak lekérdezése.

### Válasz

* **200 OK** – hiba JSON adatai (a `GET /api/hibak` listában szereplő formátummal megegyezően).

    ```json
    {
      "id": 1,
      "datum": "2025-06-01",
      "bejelento_id": 1,
      "terem": "101-es terem",
      "leiras": "Eltört egy szék.",
      "allapot": "bejelentve",
      "javito_id": null,
      "javitas_datuma": null
    }
    ```

* **404 Not Found** – ha a megadott ID-val nem létezik hiba.

* * *

5️⃣ POST `/api/hibak`
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

6️⃣ PUT `/api/hibak/:id`
---------------------------

### Leírás

Hibabejelentés szerkesztése (csak a bejelentő vagy admin, ha a hiba még „bejelentve”). **Mind a `terem`, mind a `leiras` mező megadása kötelező.**

### Kérés body

    {
      "terem": "101-es terem (újra)",
      "leiras": "A szék lába eltört, cserélni kell."
    }

### Válasz

* **200 OK** – frissített hiba JSON.

* **400 Bad Request** – ha a `terem` vagy `leiras` mező hiányzik.

  ```json
  { "error": "A terem és a leírás megadása kötelező a módosításhoz." }
  ```

* **400 Bad Request** – ha a hiba állapota már „kijavitva”.

  ```json
  { "error": "Kijavított hiba nem szerkeszthető." }
  ```

* * *

7️⃣ PUT `/api/hibak/:id/javitas`
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
| POST `/api/register`         | ❌                | ❌           | ✅     |
| POST `/api/login`            | ✅                | ✅           | ✅     |
| GET `/api/profil`            | ✅                | ✅           | ✅     |
| GET `/api/hibak`             | ✅                | ✅           | ✅     |
| GET `/api/hibak/:id`         | ✅                | ✅           | ✅     |
| POST `/api/hibak`            | ✅                | ❌           | ✅     |
| PUT `/api/hibak/:id`         | ✅ (ha bejelentő) | ❌           | ✅     |
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
