Frontend fejlesztői dokumentáció
--------------------------------

Ez a dokumentáció a Hibabejelentő alkalmazás frontend részének működését írja le.

### Áttekintés

A frontend két fő részből áll:

1. **Bejelentkezési oldal** (`index.html`, `login.js`): Felhasználói hitelesítésért felelős.
2. **Fő alkalmazás oldal** (`main.html`, `main-app.js`): A bejelentkezett felhasználók itt tudják megtekinteni és kezelni a hibabejelentéseket, valamint itt történik a profiladatok megjelenítése és a kijelentkezés.

Az alkalmazás a `server.js` által biztosított API végpontokkal kommunikál (alapértelmezett URL: `http://localhost:3000/api`).

### 1. Bejelentkezési oldal

* **Fájlok:**
  
  * `public/index.html`: A bejelentkezési űrlap HTML struktúrája.
  * `public/login.js`: A bejelentkezési logika.

* **Működés:**
  
  * A `DOMContentLoaded` eseményre betöltődik.
  * Ellenőrzi, hogy van-e már érvényes `authToken` a `sessionStorage`-ben. Ha igen, átirányít a `main.html`-re.
  * A bejelentkezési űrlap (`loginForm`) `submit` eseményére meghívja a `handleLogin` függvényt.
  * **`handleLogin(event)`**:
    * Megakadályozza az űrlap alapértelmezett beküldését.
    * Kiolvassa a felhasználónevet és jelszót az input mezőkből.
    * POST kérést küld az `/api/login` végpontra a felhasználói adatokkal.
    * Sikeres bejelentkezés (HTTP 200) esetén:
      * A kapott JWT tokent elmenti a `sessionStorage`-be `authToken` néven.
      * Átirányítja a felhasználót a `main.html` oldalra.
    * Sikertelen bejelentkezés esetén hibaüzenetet jelenít meg a `loginError` div-ben.
    * Hálózati vagy egyéb hiba esetén szintén hibaüzenetet jelenít meg.

### 2. Fő alkalmazás oldal

* **Fájlok:**
  
  * `public/main.html`: A főoldal HTML struktúrája, beleértve a navigációs sávot, hibabejelentések táblázatát, szűrőket és az új hiba bejelentésére szolgáló modális ablakot.
  * `public/main-app.js`: A főoldal dinamikus működéséért felelős JavaScript kód.

* **Működés (`main-app.js`):**
  
  * **Globális változók:**
    * `API_BASE_URL`: Az API végpontok alap URL-je.
    * `currentUserProfile`: Az aktuálisan bejelentkezett felhasználó profiladatait tárolja.
    * `allUsersMap`: Egy `Map` objektum, ami a felhasználói ID-ket és felhasználóneveket párosítja (a bejelentő/javító nevének megjelenítéséhez).
  * **`DOMContentLoaded` esemény:**
    * Ellenőrzi az `authToken` meglétét a `sessionStorage`-ben. Ha nincs, átirányít az `index.html`-re.
    * Meghívja a `loadUserProfile()`-t a felhasználói adatok betöltéséhez.
    * Sikeres profilbetöltés után meghívja a `fetchAllUsers()`-t (ha a felhasználó admin, hogy minden felhasználó nevét ismerje a hibák listázásánál) és a `loadFaults()`-t a hibabejelentések betöltéséhez.
    * Eseménykezelőket rendel a kijelentkezés (`logoutButton`), új hiba mentése (`newFaultForm`) és állapot szerinti szűrés (`filterStatus`) elemekhez.
  * **`handleLogout()`**:
    * Törli az `authToken`-t a `sessionStorage`-ből.
    * Átirányít az `index.html` oldalra.
  * **`loadUserProfile()`**:
    * GET kérést küld az `/api/profil` végpontra a token (`Authorization: Bearer <token>`) segítségével.
    * Sikeres válasz esetén:
      * Eltárolja a felhasználói adatokat a `currentUserProfile` változóban.
      * Megjeleníti a felhasználó nevét és szerepét a `userInfo` elemen.
      * Engedélyezi az "Új hiba bejelentése" gombot (`newFaultButton`), ha a felhasználó 'tanar' vagy 'admin' szerepkörű.
    * Sikertelen válasz (pl. 401, 403) esetén kijelentkezteti a felhasználót (`handleLogout()`).
  * **`fetchAllUsers()`**:
    * GET kérést küld az `/api/felhasznalok` végpontra.
    * Sikeres válasz esetén feltölti az `allUsersMap`-et a felhasználói ID-felhasználónév párokkal. Ez azért szükséges, hogy a hibák listájában a bejelentő és javító ID-k helyett a nevük jelenhessen meg.
    * _Megjegyzés:_ A `server.js` jelenlegi implementációja szerint ez a végpont minden hitelesített felhasználó számára elérhető, de a frontend logikája alapján elsősorban az adminok számára releváns a teljes lista a nevek megjelenítéséhez. Más felhasználók esetén is lefut, de lehet, hogy nem használják fel az összes adatot.
  * **`loadFaults(statusFilter = '')`**:
    * GET kérést küld az `/api/hibak` végpontra.
    * Ha a `statusFilter` paraméter meg van adva (pl. 'bejelentve', 'kijavítva'), akkor azt query paraméterként (`?allapot=...`) hozzáfűzi az URL-hez.
    * Sikeres válasz esetén meghívja a `renderFaults(faults)` függvényt a kapott hibákkal.
    * Sikertelen válasz (pl. 401, 403) esetén kijelentkezteti a felhasználót.
  * **`renderFaults(faults)`**:
    * Kiüríti a hibabejelentések táblázatának (`faultsTableBody`) tartalmát.
    * Ha nincsenek hibák, egy megfelelő üzenetet jelenít meg.
    * Minden egyes `fault` objektumhoz:
      * Létrehoz egy új sort a táblázatban.
      * Kitölti a cellákat a hiba adataival (dátum, terem, leírás, állapot, bejelentő neve, javító neve, javítás dátuma).
      * Az állapotot egy Bootstrap badge segítségével jeleníti meg (`bg-warning` vagy `bg-success`).
      * A bejelentő és javító nevét az `allUsersMap` alapján próbálja megkeresni. Ha nem található, az ID-t jeleníti meg.
      * Ha a hiba állapota 'bejelentve' és a felhasználó 'admin' vagy 'karbantarto', akkor egy "Kijavítva" gombot ad a "Műveletek" oszlophoz, amely a `handleMarkAsFixed(fault.id)` függvényt hívja meg.
  * **`handleNewFaultSubmit(event)`**:
    * Megakadályozza az űrlap alapértelmezett beküldését.
    * Kiolvassa a termet és a leírást az űrlap mezőiből.
    * POST kérést küld az `/api/hibak` végpontra az új hiba adataival.
    * Sikeres válasz (HTTP 201) esetén:
      * Bezárja az új hiba modális ablakot.
      * Újratölti a hibák listáját (`loadFaults()`).
      * Kiüríti az űrlapot.
    * Sikertelen válasz esetén hibaüzenetet jelenít meg a `newFaultError` div-ben.
  * **`handleMarkAsFixed(faultId)`**:
    * Megerősítést kér a felhasználótól.
    * PUT kérést küld az `/api/hibak/:id/javitas` végpontra (ahol `:id` a `faultId`).
    * Sikeres válasz esetén:
      * Újratölti a hibák listáját (`loadFaults()`).
    * Sikertelen válasz esetén `alert` ablakban jeleníti meg a hibát.

### ### Stíluslap

* `public/style.css`: Egyedi CSS szabályokat tartalmaz, amelyek kiegészítik a Bootstrap által biztosított stílusokat. 
