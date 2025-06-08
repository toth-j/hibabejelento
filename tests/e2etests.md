**Bejelentkezési folyamat tesztelése**

* **Teszteset LT-01: Sikeres bejelentkezés tanárként**
  
  * **Cél:** Ellenőrizni, hogy egy érvényes tanári fiókkal be lehet-e jelentkezni.
  * **Előfeltételek:** Az alkalmazás fut. Létezik egy tanári felhasználói fiók (pl. `kissp`/`kissp`).
  * **Lépések:**
    1. Nyisd meg az alkalmazás bejelentkezési oldalát (`index.html`).
    2. A "Felhasználónév" mezőbe írd be: `kissp`.
    3. A "Jelszó" mezőbe írd be: `kissp`.
    4. Kattints a "Bejelentkezés" gombra.
  * **Várt Eredmény:** A felhasználó átirányítódik a főoldalra (`main.html`). A navigációs sávban megjelenik a "Bejelentkezve: Kiss Péter (tanar)" szöveg. Az "Új hiba bejelentése" gomb aktív.

* **Teszteset LK-01: Sikeres bejelentkezés karbantartóként**
  
  * **Cél:** Ellenőrizni, hogy egy érvényes karbantartói fiókkal be lehet-e jelentkezni.
  * **Előfeltételek:** Az alkalmazás fut. Létezik egy karbantartói felhasználói fiók (pl. `szabob`/`szabob`).
  * **Lépések:**
    1. Nyisd meg az alkalmazás bejelentkezési oldalát.
    2. A "Felhasználónév" mezőbe írd be: `szabob`.
    3. A "Jelszó" mezőbe írd be: `szabob`.
    4. Kattints a "Bejelentkezés" gombra.
  * **Várt Eredmény:** A felhasználó átirányítódik a főoldalra. A navigációs sávban megjelenik a "Bejelentkezve: Szabó Béla (karbantarto)" szöveg. Az "Új hiba bejelentése" gomb inaktív.

* **Teszteset LA-01: Sikeres bejelentkezés adminisztrátorként**
  
  * **Cél:** Ellenőrizni, hogy egy érvényes adminisztrátori fiókkal be lehet-e jelentkezni.
  * **Előfeltételek:** Az alkalmazás fut. Létezik egy adminisztrátori felhasználói fiók (pl. `admin`/`Minad123`).
  * **Lépések:**
    1. Nyisd meg az alkalmazás bejelentkezési oldalát.
    2. A "Felhasználónév" mezőbe írd be: `admin`.
    3. A "Jelszó" mezőbe írd be: `Minad123`.
    4. Kattints a "Bejelentkezés" gombra.
  * **Várt Eredmény:** A felhasználó átirányítódik a főoldalra. A navigációs sávban megjelenik a "Bejelentkezve: Admin (admin)" szöveg. Az "Új hiba bejelentése" gomb aktív.

* **Teszteset L-02: Sikertelen bejelentkezés hibás adatokkal**
  
  * **Cél:** Ellenőrizni a rendszer viselkedését érvénytelen bejelentkezési adatok esetén.
  * **Előfeltételek:** Az alkalmazás fut.
  * **Lépések:**
    1. Nyisd meg az alkalmazás bejelentkezési oldalát.
    2. Adj meg egy nem létező felhasználónevet vagy helytelen jelszót (pl. `rosszuser`/`rosszjelszo`).
    3. Kattints a "Bejelentkezés" gombra.
  * **Várt Eredmény:** A bejelentkezési űrlap alatt hibaüzenet jelenik meg (pl. "Hibás felhasználónév vagy jelszó."). A felhasználó a bejelentkezési oldalon marad.

* **Teszteset L-03: Átirányítás bejelentkezett állapotban a login oldalról**
  
  * **Cél:** Ellenőrizni, hogy a rendszer átirányítja-e a már bejelentkezett felhasználót a főoldalra, ha megpróbálja elérni a login oldalt.
  * **Előfeltételek:** A felhasználó már be van jelentkezve (érvényes `authToken` van a `sessionStorage`-ben).
  * **Lépések:**
    1. A böngésző címsorába írd be az `index.html` (login oldal) URL-jét.
  * **Várt Eredmény:** A felhasználó automatikusan átirányítódik a `main.html` (főoldal) oldalra.

* **Teszteset L-04: Átirányítás kijelentkezett állapotban a főoldalról**
  
  * **Cél:** Ellenőrizni, hogy a rendszer átirányítja-e a nem bejelentkezett felhasználót a login oldalra, ha megpróbálja elérni a főoldalt.
  * **Előfeltételek:** A felhasználó nincs bejelentkezve (nincs `authToken` a `sessionStorage`-ben).
  * **Lépések:**
    1. A böngésző címsorába írd be a `main.html` (főoldal) URL-jét.
  * **Várt Eredmény:** A felhasználó automatikusan átirányítódik az `index.html` (login oldal) oldalra.

**Főoldal funkcióinak tesztelése**

* **Teszteset P-01: Profiladatok megjelenítése**
  
  * **Cél:** Ellenőrizni, hogy a bejelentkezett felhasználó neve és szerepe helyesen jelenik-e meg.
  * **Előfeltételek:** A felhasználó be van jelentkezve.
  * **Lépések:**
    1. Tekintsd meg a navigációs sávot a főoldalon.
  * **Várt Eredmény:** A "Bejelentkezve:" szöveg mellett a felhasználó neve és zárójelben a szerepköre (pl. "Kiss Péter (tanar)") helyesen látható.

* **Teszteset LO-01: Kijelentkezés**
  
  * **Cél:** Ellenőrizni a kijelentkezési funkció működését.
  * **Előfeltételek:** A felhasználó be van jelentkezve.
  * **Lépések:**
    1. Kattints a "Kijelentkezés" gombra a navigációs sávban.
  * **Várt Eredmény:** A felhasználó átirányítódik az `index.html` (login oldal) oldalra. Az `authToken` törlődik a `sessionStorage`-ből.

* **Teszteset HL-01: Hibák listázása (Összes)**
  
  * **Cél:** Ellenőrizni, hogy az összes rögzített hiba megjelenik-e a listában.
  * **Előfeltételek:** A felhasználó be van jelentkezve (bármely szerepkörrel). Vannak rögzített hibák az adatbázisban.
  * **Lépések:**
    1. Navigálj a főoldalra.
    2. Győződj meg róla, hogy az "Szűrés állapot szerint" legördülő menüben az "Összes" opció van kiválasztva.
  * **Várt Eredmény:** A hibák táblázatában megjelennek a rögzített hibák, a legfrissebbek elöl. Az oszlopok (Dátum, Terem, Leírás, Állapot, Bejelentő, Javító, Mikor, Műveletek) láthatók és helyes adatokat tartalmaznak.

* **Teszteset HL-02: Hibák listázása (Szűrés: Bejelentve)**
  
  * **Cél:** Ellenőrizni, hogy a szűrés "bejelentve" állapotra megfelelően működik-e.
  * **Előfeltételek:** A felhasználó be van jelentkezve. Vannak "bejelentve" és "kijavítva" állapotú hibák is.
  * **Lépések:**
    1. Navigálj a főoldalra.
    2. Az "Szűrés állapot szerint" legördülő menüből válaszd ki a "Bejelentve" opciót.
  * **Várt Eredmény:** A táblázatban csak azok a hibák jelennek meg, amelyek állapota "bejelentve".

* **Teszteset HL-03: Hibák listázása (Szűrés: Kijavítva)**
  
  * **Cél:** Ellenőrizni, hogy a szűrés "kijavítva" állapotra megfelelően működik-e.
  * **Előfeltételek:** A felhasználó be van jelentkezve. Vannak "bejelentve" és "kijavítva" állapotú hibák is.
  * **Lépések:**
    1. Navigálj a főoldalra.
    2. Az "Szűrés állapot szerint" legördülő menüből válaszd ki a "Kijavítva" opciót.
  * **Várt Eredmény:** A táblázatban csak azok a hibák jelennek meg, amelyek állapota "kijavítva".

**Hibakezelési folyamatok tesztelése**

* **Teszteset HÚ-01: Új hiba bejelentése tanárként**
  
  * **Cél:** Ellenőrizni, hogy egy tanár tud-e új hibát rögzíteni.
  * **Előfeltételek:** A felhasználó tanárként van bejelentkezve.
  * **Lépések:**
    1. Kattints az "Új hiba bejelentése" gombra.
    2. A megjelenő modális ablakban töltsd ki a "Terem" mezőt (pl. "101-es terem").
    3. Töltsd ki a "Leírás" mezőt (pl. "Nem működik a projektor.").
    4. Kattints a "Mentés" gombra.
  * **Várt Eredmény:** A modális ablak bezáródik. A hibák listája frissül, és az újonnan rögzített hiba megjelenik a lista elején "bejelentve" állapotban, a bejelentő neve a bejelentkezett tanár neve.

* **Teszteset HÚ-02: Új hiba bejelentése adminisztrátorként**
  
  * **Cél:** Ellenőrizni, hogy egy adminisztrátor tud-e új hibát rögzíteni.
  * **Előfeltételek:** A felhasználó adminisztrátorként van bejelentkezve.
  * **Lépések:**
    1. Kattints az "Új hiba bejelentése" gombra.
    2. A megjelenő modális ablakban töltsd ki a "Terem" mezőt (pl. "Tornaterem").
    3. Töltsd ki a "Leírás" mezőt (pl. "Lyukas a labda.").
    4. Kattints a "Mentés" gombra.
  * **Várt Eredmény:** A modális ablak bezáródik. A hibák listája frissül, és az újonnan rögzített hiba megjelenik a lista elején "bejelentve" állapotban, a bejelentő neve a bejelentkezett adminisztrátor neve.

* **Teszteset HÚ-03: Új hiba bejelentése karbantartóként (sikertelen)**
  
  * **Cél:** Ellenőrizni, hogy egy karbantartó nem tud új hibát rögzíteni.
  * **Előfeltételek:** A felhasználó karbantartóként van bejelentkezve.
  * **Lépések:**
    1. Figyeld meg az "Új hiba bejelentése" gomb állapotát a főoldalon.
  * **Várt Eredmény:** Az "Új hiba bejelentése" gomb inaktív (nem kattintható).

* **Teszteset HÚ-04: Új hiba bejelentése hiányzó mezőkkel**
  
  * **Cél:** Ellenőrizni a rendszer viselkedését, ha az új hiba űrlap nincs megfelelően kitöltve.
  * **Előfeltételek:** A felhasználó tanárként vagy adminisztrátorként van bejelentkezve.
  * **Lépések:**
    1. Kattints az "Új hiba bejelentése" gombra.
    2. Hagyd üresen a "Terem" mezőt, de töltsd ki a "Leírás" mezőt.
    3. Kattints a "Mentés" gombra.
  * **Várt Eredmény:** Hibaüzenet jelenik meg a modális ablakban (pl. "A terem és a leírás megadása kötelező."). A modális ablak nem záródik be. A hiba nem kerül rögzítésre. (Ismételd meg a tesztet úgy is, hogy a "Leírás" mezőt hagyod üresen.)

* **Teszteset HJ-01: Hiba kijavítottra állítása karbantartóként**
  
  * **Cél:** Ellenőrizni, hogy egy karbantartó tud-e egy hibát "kijavítva" állapotra állítani.
  * **Előfeltételek:** A felhasználó karbantartóként van bejelentkezve. Létezik legalább egy "bejelentve" állapotú hiba a rendszerben.
  * **Lépések:**
    1. Keresd meg a hibák listájában az egyik "bejelentve" állapotú hibát.
    2. Kattints a hiba sorának "Műveletek" oszlopában található "Javítás" gombra.
    3. A megjelenő megerősítő kérdésre kattints az "OK" (vagy "Igen") gombra.
  * **Várt Eredmény:** A hiba állapota a listában "kijavítva"-ra változik. A "Javító" oszlopban megjelenik a bejelentkezett karbantartó neve, a "Mikor" oszlopban pedig az aktuális dátum. A "Javítás" gomb eltűnik az adott sorból.

* **Teszteset HJ-02: Hiba kijavítottra állítása adminisztrátorként**
  
  * **Cél:** Ellenőrizni, hogy egy adminisztrátor tud-e egy hibát "kijavítva" állapotra állítani.
  * **Előfeltételek:** A felhasználó adminisztrátorként van bejelentkezve. Létezik legalább egy "bejelentve" állapotú hiba a rendszerben.
  * **Lépések:**
    1. Keresd meg a hibák listájában az egyik "bejelentve" állapotú hibát.
    2. Kattints a hiba sorának "Műveletek" oszlopában található "Javítás" gombra.
    3. A megjelenő megerősítő kérdésre kattints az "OK" (vagy "Igen") gombra.
  * **Várt Eredmény:** A hiba állapota a listában "kijavítva"-ra változik. A "Javító" oszlopban megjelenik a bejelentkezett adminisztrátor neve, a "Mikor" oszlopban pedig az aktuális dátum. A "Javítás" gomb eltűnik az adott sorból.

* **Teszteset HJ-03: Hiba kijavítottra állítása tanárként (sikertelen)**
  
  * **Cél:** Ellenőrizni, hogy egy tanár nem tud hibát "kijavítva" állapotra állítani.
  * **Előfeltételek:** A felhasználó tanárként van bejelentkezve. Létezik legalább egy "bejelentve" állapotú hiba.
  * **Lépések:**
    1. Keresd meg a hibák listájában az egyik "bejelentve" állapotú hibát.
    2. Figyeld meg a hiba sorának "Műveletek" oszlopát.
  * **Várt Eredmény:** Nincs "Javítás" gomb a tanár számára a "Műveletek" oszlopban.

* **Teszteset HJ-04: Hiba kijavítottra állítása (már kijavított hiba esetén - sikertelen)**
  
  * **Cél:** Ellenőrizni, hogy egy már kijavított hibát nem lehet újra kijavítottra állítani.
  * **Előfeltételek:** A felhasználó karbantartóként vagy adminisztrátorként van bejelentkezve. Létezik legalább egy "kijavítva" állapotú hiba.
  * **Lépések:**
    1. Keresd meg a hibák listájában az egyik "kijavítva" állapotú hibát.
    2. Figyeld meg a hiba sorának "Műveletek" oszlopát. (Ha a gomb nem látszik, a teszt sikeres. Ha valamilyen okból mégis látszana és kattintható lenne, próbáld meg.)
  * **Várt Eredmény:** A "Javítás" gomb nem látható a már kijavított hibák sorában. Ha API hívással próbálnánk, a szervernek 409 Conflict hibát kellene visszaadnia ("A hiba már ki van javítva.").

**Felhasználói felület (UI) tesztelése**

* **Teszteset UI-01: Reszponzivitás (Mobil álló nézet)**
  
  * **Cél:** Ellenőrizni az alkalmazás megjelenését és használhatóságát kisebb képernyőkön (mobiltelefon, álló tájolás).
  * **Előfeltételek:** Az alkalmazás fut.
  * **Lépések:**
    1. Nyisd meg az alkalmazást egy mobil eszközön, vagy egy asztali böngészőben szűkítsd le az ablak szélességét mobil nézetre (pl. böngésző fejlesztői eszközeivel).
    2. Ellenőrizd a bejelentkezési oldalt és a főoldalt (bejelentkezés után).
  * **Várt Eredmény:** Az elemek (űrlapok, gombok, táblázat) megfelelően átrendeződnek, olvashatók és használhatók. A navigációs sáv összecsukható menüvé alakul ("hamburger" ikon). A hibák táblázata szükség esetén vízszintesen görgethető, hogy minden oszlop látható legyen.

* **Teszteset UI-02: Reszponzivitás (Mobil fekvő nézet)**
  
  * **Cél:** Ellenőrizni az alkalmazás megjelenését és használhatóságát mobiltelefon fekvő tájolásában.
  * **Előfeltételek:** Az alkalmazás fut egy mobil eszközön vagy szimulátorban.
  * **Lépések:**
    1. Fordítsd el a mobil eszközt fekvő (landscape) nézetbe, vagy állítsd be ezt a nézetet a böngésző fejlesztői eszközeiben.
    2. Ellenőrizd a bejelentkezési oldalt és a főoldalt.
  * **Várt Eredmény:** Az elrendezés alkalmazkodik a fekvő nézethez. A táblázat tartalma jobban áttekinthető lehet a nagyobb szélesség miatt. Az elemek továbbra is használhatók.
