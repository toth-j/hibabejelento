Frontend fejlesztői dokumentáció
--------------------------------

## Tartalomjegyzék

- [Áttekintés](#áttekintés)
- [Bejelentkezési oldal](#bejelentkezési-oldal)
- [Fő alkalmazás oldal](#fő-alkalmazás-oldal)
- [Felhasználókezelő oldal (Adminoknak)](#felhasználókezelő-oldal-adminoknak)
- [Súgó oldal](#súgó-oldal)
- [Navigáció](#navigáció)
- [Stíluslap](#stíluslap)
- [Tesztelés](#tesztelés)

Ez a dokumentáció a Hibabejelentő alkalmazás frontend részének működését írja le.

### Áttekintés

A frontend négy fő részből áll:

1. **Bejelentkezési oldal** (`index.html`, `login.js`): Felhasználói hitelesítésért felelős.
2. **Fő alkalmazás oldal** (`main.html`, `main-app.js`): A bejelentkezett felhasználók itt tudják megtekinteni és kezelni a hibabejelentéseket, valamint itt történik a profiladatok megjelenítése és a kijelentkezés.
3. **Felhasználókezelő oldal** (`admin_users.html`, `admin_users.js`): Csak adminisztrátorok számára elérhető oldal új felhasználók felvételére és meglévők törlésére.
4. **Súgó oldal** (`help.html`): Statikus információs oldal az alkalmazás használatáról.
   Az alkalmazás a `server.js` által biztosított API végpontokkal kommunikál (alapértelmezett URL: `http://localhost:3000/api`).

### Bejelentkezési oldal

- **Fájlok:**
  
  - `public/index.html`: A bejelentkezési űrlap HTML struktúrája.
  - `public/login.js`: A bejelentkezési logika.

- **Működés:**
  
  - A `DOMContentLoaded` eseményre betöltődik.
  - Ellenőrzi, hogy van-e már érvényes `authToken` a `sessionStorage`-ben. Ha igen, átirányít a `main.html`-re.
  - A bejelentkezési űrlap (`loginForm`) `submit` eseményére meghívja a `handleLogin` függvényt.
  - **`handleLogin(event)`**:
    - Megakadályozza az űrlap alapértelmezett beküldését.
    - Kiolvassa a felhasználónevet és jelszót az input mezőkből.
    - POST kérést küld az `/api/login` végpontra a felhasználói adatokkal.
    - Sikeres bejelentkezés (HTTP 200) esetén:
      - A kapott JWT tokent elmenti a `sessionStorage`-be `authToken` néven.
      - Átirányítja a felhasználót a `main.html` oldalra.
    - Sikertelen bejelentkezés esetén hibaüzenetet jelenít meg a `loginError` div-ben.
    - Hálózati vagy egyéb hiba esetén szintén hibaüzenetet jelenít meg.

### Fő alkalmazás oldal

- **Fájlok:**
  
  - `public/main.html`: A főoldal HTML struktúrája, beleértve a navigációs sávot, hibabejelentések táblázatát, szűrőket és az új hiba bejelentésére szolgáló űrlapot.
  - `public/main-app.js`: A főoldal dinamikus működéséért felelős JavaScript kód.

- **Működés (`main-app.js`):**
  
  - **Globális változók:**
    - `API_BASE_URL`: Az API végpontok alap URL-je.
    - `currentUserProfile`: Az aktuálisan bejelentkezett felhasználó profiladatait tárolja.
    - `allUsersMap`: Egy `Map` objektum, ami a felhasználói ID-ket és felhasználóneveket párosítja (a bejelentő/javító nevének megjelenítéséhez).
  - **`DOMContentLoaded` esemény:**
    - Ellenőrzi az `authToken` meglétét a `sessionStorage`-ben. Ha nincs, átirányít az `index.html`-re.
    - Meghívja a `loadUserProfile()`-t a felhasználói adatok betöltéséhez.
    - Sikeres profilbetöltés után meghívja a `fetchAllUsers()`-t (ha a felhasználó admin, hogy minden felhasználó nevét ismerje a hibák listázásánál) és a `loadFaults()`-t a hibabejelentések betöltéséhez.
    - Eseménykezelőket rendel a kijelentkezés (`logoutButton`), új hiba mentése (`newFaultForm`) és állapot szerinti szűrés (`filterStatus`) elemekhez.
  - **`handleLogout()`**:
    - Törli az `authToken`-t a `sessionStorage`-ből.
    - Átirányít az `index.html` oldalra.
  - **`loadUserProfile()`**:
    - GET kérést küld az `/api/profil` végpontra a token (`Authorization: Bearer <token>`) segítségével.
    - Sikeres válasz esetén:
      - Eltárolja a felhasználói adatokat a `currentUserProfile` változóban.
      - Megjeleníti a felhasználó nevét és szerepét a `userInfo` elemen.
      - Megjeleníti az új hiba bejelentésére szolgáló űrlapot (`newFaultFormContainer`), ha a felhasználó 'tanar' vagy 'admin' szerepkörű.
      - Megjeleníti a "Felhasználók" linket (`adminUsersLinkContainer`) a navigációs sávban, ha a felhasználó 'admin'.
    - Sikertelen válasz (pl. 401, 403) esetén kijelentkezteti a felhasználót (`handleLogout()`).
  - **`fetchAllUsers()`**:
    - GET kérést küld az `/api/felhasznalok` végpontra.
    - Sikeres válasz esetén feltölti az `allUsersMap`-et a felhasználói ID-felhasználónév párokkal. Ez azért szükséges, hogy a hibák listájában a bejelentő és javító ID-k helyett a nevük jelenhessen meg.
    - _Megjegyzés:_ A `server.js` jelenlegi implementációja szerint ez a végpont minden hitelesített felhasználó számára elérhető, de a frontend logikája alapján elsősorban az adminok számára releváns a teljes lista a nevek megjelenítéséhez. Más felhasználók esetén is lefut, de lehet, hogy nem használják fel az összes adatot.
  - **`loadFaults(statusFilter = '')`**:
    - GET kérést küld az `/api/hibak` végpontra.
    - Ha a `statusFilter` paraméter meg van adva (pl. 'bejelentve', 'kijavítva'), akkor azt query paraméterként (`?allapot=...`) hozzáfűzi az URL-hez.
    - Sikeres válasz esetén meghívja a `renderFaults(faults)` függvényt a kapott hibákkal.
    - Sikertelen válasz (pl. 401, 403) esetén kijelentkezteti a felhasználót.
  - **`renderFaults(faults)`**:
    - Kiüríti a hibabejelentések táblázatának (`faultsTableBody`) tartalmát.
    - Ha nincsenek hibák, egy megfelelő üzenetet jelenít meg.
    - Minden egyes `fault` objektumhoz:
      - Létrehoz egy új sort a táblázatban.
      - Kitölti a cellákat a hiba adataival (dátum, terem, leírás, állapot, bejelentő neve, javító neve, javítás dátuma).
      - Az állapotot egy Bootstrap badge segítségével jeleníti meg (`bg-warning` vagy `bg-success`).
      - A bejelentő és javító nevét az `allUsersMap` alapján próbálja megkeresni. Ha nem található, az ID-t jeleníti meg.
      - Ha a hiba állapota 'bejelentve' és a felhasználó 'admin' vagy 'karbantarto', akkor egy "Javítás" gombot ad a "Műveletek" oszlophoz, amely a `handleMarkAsFixed(fault.id)` függvényt hívja meg.
  - **`handleNewFaultSubmit(event)`**:
    - Megakadályozza az űrlap alapértelmezett beküldését.
    - Kiolvassa a termet és a leírást az űrlap mezőiből.
    - POST kérést küld az `/api/hibak` végpontra az új hiba adataival.
    - Sikeres válasz (HTTP 201) esetén:
      - Bezárja az új hiba modális ablakot.
      - Újratölti a hibák listáját (`loadFaults()`), az űrlap látható marad.
      - Kiüríti az űrlapot.
    - Sikertelen válasz esetén hibaüzenetet jelenít meg a `newFaultError` div-ben.
  - **`handleMarkAsFixed(faultId)`**:
    - Megerősítést kér a felhasználótól.
    - PUT kérést küld az `/api/hibak/:id/javitas` végpontra (ahol `:id` a `faultId`).
    - Sikeres válasz esetén:
      - Újratölti a hibák listáját (`loadFaults()`).
    - Sikertelen válasz esetén `alert` ablakban jeleníti meg a hibát.

### Felhasználókezelő oldal (Adminoknak)

- **Fájlok:**
  
  - `public/admin_users.html`: A felhasználókezelő oldal HTML struktúrája, beleértve az új felhasználó felvételére szolgáló űrlapot és a meglévő felhasználók listáját.
  - `public/admin_users.js`: A felhasználókezelő oldal dinamikus működéséért felelős JavaScript kód.

- **Működés (`admin_users.js`):**
  
  - **Globális változók:**
    - `API_BASE_URL`: Az API végpontok alap URL-je.
    - `currentUserProfile`: Az aktuálisan bejelentkezett adminisztrátor profiladatait tárolja.
  - **`DOMContentLoaded` esemény:**
    - Ellenőrzi az `authToken` meglétét. Ha nincs, átirányít az `index.html`-re.
    - Meghívja a `loadUserProfile()`-t.
    - Ha a betöltött profil adminisztrátori (`currentUserProfile.szerep === 'admin'`):
      - Megjeleníti az adminisztrátori tartalmat (`adminContent`).
      - Meghívja a `loadUsers()`-t a felhasználók listázásához.
      - Eseménykezelőt rendel az új felhasználó űrlapjához (`newUserForm`).
    - Ha nem admin, egy "Hozzáférés megtagadva" üzenetet jelenít meg.
    - Eseménykezelőt rendel a kijelentkezés gombhoz (`logoutButton`).
  - **`handleLogout()`**: Megegyezik a `main-app.js`-ben lévővel.
  - **`loadUserProfile()`**: Hasonló a `main-app.js`-ben lévőhöz, betölti és megjeleníti az admin profilját.
  - **`loadUsers()`**:
    - GET kérést küld az `/api/felhasznalok` végpontra.
    - Sikeres válasz esetén meghívja a `renderUsers(users)` függvényt.
    - Hiba esetén üzenetet jelenít meg (`userListErrorDiv`).
  - **`renderUsers(users)`**:
    - Kiüríti a felhasználók táblázatát (`usersTableBody`).
    - Minden felhasználóhoz létrehoz egy sort a táblázatban (ID, Név, Felhasználónév, Szerepkör).
    - Ha a listázott felhasználó nem azonos a bejelentkezett adminisztrátorral, egy "Törlés" gombot ad a sorhoz, amely a `handleDeleteUser(user.id, user.felhasznalonev)` függvényt hívja.
  - **`handleNewUserSubmit(event)`**:
    - Kiolvassa az új felhasználó adatait az űrlapból.
    - POST kérést küld az `/api/felhasznalok` végpontra.
    - Sikeres válasz esetén újratölti a felhasználók listáját (`loadUsers()`) és kiüríti az űrlapot.
    - Hiba esetén üzenetet jelenít meg (`newUserErrorDiv`).
  - **`handleDeleteUser(userId, username)`**:
    - Megerősítést kér a felhasználótól.
    - DELETE kérést küld az `/api/felhasznalok/:id` végpontra.
    - Sikeres válasz esetén újratölti a felhasználók listáját.
    - Hiba esetén üzenetet jelenít meg (`userListErrorDiv` és `alert`).

### Súgó oldal

- **Fájl:**
  - `public/help.html`: Statikus HTML oldal, amely az alkalmazás használatáról nyújt tájékoztatást.
- **Működés:**
  - A `main.html` és `admin_users.html` oldalakon található "Súgó" linkek új böngészőlapon (`target="_blank"`) nyitják meg ezt az oldalt.
  - A navigációs sávja egyszerűsített: tartalmazza az alkalmazás nevét és egy "Bezárás" gombot.
  - A "Bezárás" gomb a `window.close()` JavaScript függvényt hívja meg, ami megpróbálja bezárni az aktuális böngészőlapot/fület. (Ennek működése böngészőfüggő lehet.)

### Navigáció

- A `main.html` és `admin_users.html` oldalak egységes navigációs sávval rendelkeznek.
- A "Felhasználók" menüpont (`admin_users.html`) csak akkor látható a navigációs sávban, ha adminisztrátor van bejelentkezve. Ezt a `main-app.js` és az `admin_users.js` `loadUserProfile` függvénye kezeli.
- A "Súgó" link minden esetben új lapon nyílik meg.

### Stíluslap



- `public/style.css`: Egyedi CSS szabályokat tartalmaz, amelyek kiegészítik a Bootstrap által biztosított stílusokat.

### Tesztelés

A frontend alkalmazás tesztelése manuális végponttól végpontig (End-to-End - E2E) tesztekkel történik. Ezek a tesztek a felhasználói felületen keresztül szimulálják a felhasználói interakciókat és ellenőrzik a rendszer viselkedését.

#### Tesztadatok előkészítése

A teszteléshez szükséges alap felhasználói és hibajegy adatokat a projekt gyökérkönyvtárában található `tesztadatok.sql` fájl tartalmazza. A tesztadatbázis létrehozásához és feltöltéséhez futtasd a következő parancsot a projekt gyökérkönyvtárából:
`sqlite3 hibabejelento.db < tesztadatok.sql`

A részletes tesztesetek, beleértve a lépéseket és a várt eredményeket, a `tests/e2etests.md` fájlban találhatók.

* * *
