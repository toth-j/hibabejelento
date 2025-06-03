## **Hibabejelentő webes alkalmazás specifikációja**

### **1. Az alkalmazás célja**

Az iskola portáján lévő füzetet kiváltó digitális hibabejelentő és -nyilvántartó rendszer készítése. A felhasználók bejelenthetik a hibákat, a karbantartók pedig jelezhetik a hibák javítását benne. A rendszer webes felületű, számítógépről és mobilról egyaránt elérhető.

* * *

### **2. Funkciók**

#### **2.1. Felhasználók**

* **Tanár**: Hibát jelenthet be.
* **Karbantartó**: Megtekintheti a hibabejelentéseket, és jelezheti a hibák javítását.
* **Adminisztrátor**: Hibát jelenthet be, megtekintheti a hibabejelentéseket, és jelezheti a hibák javítását. A felhasználók létrehozása, módosítása vagy törlése jelenleg nem része az API funkcionalitásának (az adatbázisba manuálisan vagy SQL szkripttel kerülnek feltöltésre).

#### **2.2. Hibabejelentés**

* Új hiba rögzítése:
  
  * Dátum (automatikusan a rögzítés dátuma).
  
  * Tanár neve (bejelentkezett felhasználóból automatikusan kitöltődik).
  
  * Terem száma vagy neve (szövegként).
  
  * Hiba rövid leírása (szöveges mező).

#### **2.3. Hibák listázása**

* **Mindenki** láthatja:
  
  * Hibák listáját dátum szerint rendezve (elöl a frissebb hibák).
  
  * Minden hiba adatait: dátum, tanár neve, terem, leírás, bejelentő neve, javítás állapota („Bejelentve” vagy „Kijavítva”), karbantartó neve, javítás dátuma.

* **Szűrők**:
  
  * Javítási állapot szerint (`bejelentve`, `kijavítva`).

#### **2.4. Hiba javításának kezelése (karbantartók és adminisztrátorok számára)**

* A karbantartó vagy adminisztrátor kiválaszthatja a hibát, és „Kijavítva” állapotra állíthatja.

* Ekkor rögzítésre kerül:
  
  * A javító neve (automatikusan).
  
  * Javítás dátuma (automatikusan).

#### **2.5. Felhasználó azonosítás és jogosultságkezelés**

* **Bejelentkezés**
  
  * Tanárok, karbantartók és adminisztrátorok felhasználói fiókkal rendelkeznek.
  
  * Jogosultságok:
    * Tanár: Hibát jelenthet be, listázhatja a hibákat.
    * Karbantartó: Listázhatja a hibákat, hibát javítottra állíthat.
    * Adminisztrátor: Hibát jelenthet be, listázhatja a hibákat, hibát javítottra állíthat.

* * *

### **3. Felhasználói felület (UI)**

* **Reszponzív**: mobilon és asztali gépen is használható. Mobilon ajánlott a landscape (fekvő) nézetben.

* **Bejelentkezés / Regisztráció** oldal
  * Név és jelszó megadásával be lehet jelentkezni.

* **Főoldal / Dashboard**:
  
  * Hibák listája, legfrissebbek elől.
  
  * Gomb: „Új hiba bejelentése” (tanárok és adminisztrátorok számára).
  
  * Szűrési lehetőség állapot szerint.

* **Új hiba bejelentése**:
  
  * Egyszerű modális ablak a szükséges mezőkkel.

* * *

### **4. Technikai követelmények**

* **Backend**:
  
  * REST API (pl. Node.js + Express).
  
  * Adatbázis (SQLite).

* **Frontend**:
  
  * HTML, CSS, JavaScript.

* **Hitelesítés**:
  * Felhasználónév/jelszó alapú bejelentkezés, JWT (JSON Web Token) alapú munkamenetkezelés.

* **Adatok tárolása**:
  
  * Hibabejelentések, felhasználók.
* **Verziókezelés**
  * Git, GitHub

* * *

### **5. Továbbfejlesztési lehetőségek**

* **E-mail értesítés** a karbantartóknak új hibabejelentés esetén.

* **Kép feltöltése** a hibához (pl. fotó a törött székről).

* * *
