## **Hibabejelentő webes alkalmazás specifikációja**

### **1. Az alkalmazás célja**

Az iskola portáján lévő füzetet kiváltó digitális hibabejelentő és -nyilvántartó rendszer készítése. A felhasználók bejelenthetik a hibákat, a karbantartók pedig jelezhetik a hibák javítását benne. A rendszer webes felületű, számítógépről és mobilról egyaránt elérhető.

* * *

### **2. Funkciók**

#### **2.1. Felhasználói szerepkörök és jogosultságok**

* **Tanár**:
  * Bejelenthet új hibákat.
  * Megtekintheti az összes hibabejelentést.
* **Karbantartó**:
  * Megtekintheti az összes hibabejelentést.
  * A "Bejelentve" állapotú hibákat "Kijavítva" állapotra állíthatja.
* **Adminisztrátor**:
  * Bejelenthet új hibákat.
  * Megtekintheti az összes hibabejelentést.
  * A "Bejelentve" állapotú hibákat "Kijavítva" állapotra állíthatja.
  * Új felhasználókat vehet fel a rendszerbe.
  * Meglévő felhasználókat törölhet a rendszerből (saját magát kivéve).

#### **2.2. Hibabejelentés (Tanárok és Adminisztrátorok számára)**

* Új hiba rögzítésekor a következő adatok kerülnek mentésre:
  * **Dátum**: Automatikusan a rögzítés dátuma (YYYY-MM-DD formátumban).
  * **Bejelentő**: Automatikusan a bejelentkezett felhasználó (ID alapján).
  * **Terem**: A felhasználó által megadott szöveg (pl. "101-es terem", "Folyosó").
  * **Leírás**: A felhasználó által megadott szöveges leírás a hibáról.
  * **Állapot**: Automatikusan "bejelentve".

#### **2.3. Hibák listázása (Minden bejelentkezett felhasználó számára)**

* A hibák listája dátum szerint csökkenő sorrendben jelenik meg (a legfrissebbek elöl).
* Minden hiba esetén megjelenített adatok:
  * Bejelentés dátuma
  * Terem
  * Leírás
  * Állapot (pl. "bejelentve", "kijavítva", Bootstrap badge-dzsel színezve)
  * Bejelentő felhasználóneve
  * Javító felhasználóneve (ha van)
  * Javítás dátuma (ha van)
  * Műveletek (pl. "Javítás" gomb, jogosultságtól függően)
* **Szűrési lehetőség**: A hibák listája szűrhető állapot szerint ("Összes", "Bejelentve", "Kijavítva").

#### **2.4. Hiba javításának kezelése (Karbantartók és Adminisztrátorok számára)**

* A "Bejelentve" állapotú hibák mellett megjelenik egy "Javítás" gomb.
* A gombra kattintva a hiba állapota "Kijavítva" lesz.
* Automatikusan rögzítésre kerül:
  * A javító felhasználó (ID alapján).
  * A javítás dátuma (aktuális dátum, YYYY-MM-DD formátumban).

#### **2.5. Felhasználókezelés (csak adminisztrátorok számára)**

* **Új felhasználó felvétele**: Név, egyedi felhasználónév, jelszó és szerepkör (tanar, karbantarto, admin) megadásával.
* **Felhasználók listázása**: ID, név, felhasználónév, szerepkör.
* **Felhasználó törlése**: Adminisztrátor törölhet más felhasználókat. Saját magát nem törölheti. Felhasználó nem törölhető, ha kapcsolódó hibabejegyzése van (bejelentőként vagy javítóként).

#### **2.6. Felhasználói hitelesítés és munkamenet-kezelés**

* Bejelentkezés felhasználónév és jelszó párossal.
* Sikeres bejelentkezés után JWT (JSON Web Token) kerül kiállításra, amelyet a kliens a további API kéréseknél használ.
* Kijelentkezéskor a token érvénytelenné válik a kliens oldalon (pl. törlődik a `sessionStorage`-ből).

* * *

### **3. Felhasználói felület (UI)**

* **Reszponzív kialakítás**: Az alkalmazás asztali gépen és mobil eszközökön (álló és fekvő nézetben) is használható.
* **Bejelentkezési oldal (`index.html`)**: Felhasználónév és jelszó beviteli mezők, "Bejelentkezés" gomb.
* **Főoldal (`main.html`)**:
  * Navigációs sáv: Alkalmazás neve, "Hibajegyek" link, "Felhasználók" link (csak adminoknak), "Súgó" link (új lapon nyílik meg), bejelentkezett felhasználó neve és szerepe, "Kijelentkezés" gomb.
  * "Új hiba rögzítése" űrlap: Terem és leírás beviteli mezők, "Hiba bejelentése" gomb. Ez az űrlap csak tanárok és adminisztrátorok számára látható.
  * Szűrő: Legördülő menü a hibák állapot szerinti szűrésére.
  * Hibák táblázata: A 2.3. pontban leírt adatokkal és műveletekkel.
* **Felhasználókezelő oldal (`admin_users.html` - csak adminisztrátoroknak)**:
  * Navigációs sáv (megegyezik a főoldaléval, "Felhasználók" link aktív).
  * "Új felhasználó hozzáadása" űrlap: Név, felhasználónév, jelszó, szerepkör beviteli mezők, "Felhasználó hozzáadása" gomb.
  * "Meglévő felhasználók" táblázat: ID, név, felhasználónév, szerepkör, "Törlés" gomb (kivéve saját magánál).
* **Súgó oldal (`help.html`)**:
  * Statikus információs oldal az alkalmazás használatáról.
  * Egyszerűsített navigációs sáv: Alkalmazás neve, "Bezárás" gomb (amely megpróbálja bezárni az aktuális böngészőlapot).

* * *

### **4. Technikai követelmények**

* **Backend**: Node.js + Express.js keretrendszerrel készített REST API.
* **Adatbázis**: SQLite, better-sqlite3 csomaggal.
* **Frontend**: HTML, CSS, vanilla JavaScript. Bootstrap 5 keretrendszer a reszponzív kialakításért és stílusért.
* **Hitelesítés**: Jelszó-hashelés (bcrypt.js), JWT alapú munkamenet-kezelés.
* **Verziókezelés**: Git, GitHub.

* * *

### **5. Továbbfejlesztési lehetőségek**

* E-mail értesítés küldése a karbantartóknak új hibabejelentés esetén.
* Képfeltöltési lehetőség a hibákhoz.
* Részletesebb naplózás.
* Jelszócsere lehetőség a felhasználóknak.
* Hibajegyekhez prioritás rendelése.

* * *
