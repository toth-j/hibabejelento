### **Hibabejelentő webes alkalmazás specifikációja**

#### **1. Az alkalmazás célja**

A portán lévő füzetet kiváltó digitális hibabejelentő és -nyilvántartó rendszer készítése. A felhasználók bejelenthetik a hibákat, a karbantartók pedig jelezhetik a hibák javítását benne. A rendszer webes felületű, számítógépről és mobilról egyaránt elérhető.

* * *

#### **2. Funkciók**

##### **2.1. Felhasználók**

* **Tanár**: Hibát jelenthet be.

* **Karbantartó**: Megtekintheti a hibabejelentéseket, és jelezheti a hibák javítását.

* **Adminisztrátor**: Felhasználók kezelése (pl. tanárok, karbantartók regisztrációja).

##### **2.2. Hibabejelentés**

* Új hiba rögzítése:
  
  * Dátum (automatikusan a rögzítés dátuma, de szerkeszthető, ha szükséges).
  
  * Tanár neve (bejelentkezett felhasználóból automatikusan kitöltődik).
  
  * Terem száma vagy neve (szövegként).
  
  * Hiba rövid leírása (szöveges mező).

##### **2.3. Hibák listázása**

* **Mindenki** láthatja:
  
  * Hibák listáját dátum szerint rendezve (elöl a frissebb hibák).
  
  * Minden hiba adatait: dátum, tanár neve, terem, leírás, javítás állapota (pl. „Javításra vár” vagy „Kijavítva”), karbantartó neve, javítás dátuma.

* **Szűrők**:
  
  * Javítási állapot szerint (pl. csak a még nyitott hibák).
  
  * Terem szerint.
  
  * Dátum intervallum szerint.

##### **2.4. Hiba javításának kezelése (karbantartók számára)**

* A karbantartó kiválaszthatja a hibát, és „Kijavítva” állapotra állíthatja.

* Ekkor rögzítésre kerül:
  
  * A karbantartó neve (automatikusan).
  
  * Javítás dátuma (automatikusan).

##### **2.5. Felhasználó azonosítás / jogosultság**

* **Bejelentkezés**
  
  * Tanárok és karbantartók felhasználói fiókkal rendelkeznek.
  
  * Jogosultságok: tanár csak hibát jelenthet, karbantartó javítást is végezhet.

* * *

#### **3. Felhasználói felület (UI)**

* **Reszponzív**: mobilon és asztali gépen is jól használható.

* **Bejelentkezés / Regisztráció** oldal

* **Főoldal / Dashboard**:
  
  * Legfrissebb hibák listája.
  
  * Gomb: „Új hiba bejelentése”.
  
  * Szűrési lehetőségek.

* **Új hiba bejelentése** oldal:
  
  * Egyszerű űrlap a szükséges mezőkkel.

* **Hibák részletei**:
  
  * Egy hiba adatainak részletes megtekintése, szerkesztése.
  
  * Karbantartó számára: „Kijavítva” gomb.

* * *

#### **4. Technikai követelmények**

* **Backend**:
  
  * REST API (pl. Node.js + Express).
  
  * Adatbázis (SQLite).

* **Frontend**:
  
  * HTML, CSS, JavaScript.

* **Hitelesítés**:
  
  * Egyszerű belépés (felhasználónév/jelszó).

* **Adatok tárolása**:
  
  * Hibabejelentések, felhasználók.
* **Verziókezelés**
  * Git, GitHub

* * *

#### **5. továbbfejlesztési lehetőségek**

* **E-mail értesítés** a karbantartóknak új hibabejelentés esetén.

* **Kép feltöltése** a hibához (pl. fotó a törött székről).

* * *

#### **6. Követelmények a vizsgaremek szintjén**

* Az alapfunkciók (hiba bejelentés, lista, javítás állapot kezelése) megvalósítása kötelező.

* A UI legyen egyszerű, de átlátható és reszponzív.

* Dokumentáció: rövid technikai leírás a projekt szerkezetéről (pl. adatbázis struktúra, főbb API végpontok).

* Verziókövetés: javasolt Git (pl. GitHub repo).


