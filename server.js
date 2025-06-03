// server.js
require('dotenv').config();
const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const DB_PATH = process.env.DB_PATH || './hibabejelento.db';

app.use(cors());
app.use(express.json());

// Statikus fájlok kiszolgálása a 'public' mappából
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// Adatbázis kapcsolat inicializálása
let db;
try {
  db = new Database(DB_PATH, { /* verbose: console.log */ });
  console.log('Sikeresen csatlakozva a hibabejelento.db adatbázishoz (better-sqlite3).');
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  initializeDb();
} catch (err) {
  console.error('Hiba az adatbázishoz csatlakozáskor vagy inicializáláskor:', err.message);
  process.exit(1); // Kilépés, ha az adatbázis nem elérhető
}

// Adatbázis séma inicializálása (ha még nem létezik)
function initializeDb() {
  try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS felhasznalok (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nev TEXT NOT NULL,
          felhasznalonev TEXT UNIQUE NOT NULL,
          jelszo TEXT NOT NULL,
          szerep TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS hibak (
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
    `);
  } catch (err) {
    console.error("Hiba az adatbázis séma inicializálásakor:", err.message);
  }
}

// Segédfüggvények adatbázis műveletekhez (better-sqlite3 szinkron API)
function dbGet(sql, params = []) {
  return db.prepare(sql).get(...params);
}

function dbAll(sql, params = []) {
  return db.prepare(sql).all(...params);
}

function dbRun(sql, params = []) {
  return db.prepare(sql).run(...params);
  // Visszaadja az info objektumot (pl. lastInsertRowid, changes)
}

// Middleware: JWT token hitelesítése
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Hiányzó vagy érvénytelen token.' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Érvénytelen token vagy lejárt munkamenet.' });
    req.user = user;
    next();
  });
}

// --- VÉGPONTOK ---

// 1. POST /api/register - Felhasználó regisztrálása (admin által)
app.post('/api/register', authenticateToken, async (req, res) => {
  const { nev, felhasznalonev, jelszo, szerep } = req.body;
  if (req.user.szerep !== 'admin') {
    return res.status(403).json({ error: 'Nincs jogosultsága ehhez a művelethez.' });
  }
  if (!nev || !felhasznalonev || !jelszo || !szerep) {
    return res.status(400).json({ error: 'Minden mező kitöltése kötelező.' });
  }
  if (!['tanar', 'karbantarto', 'admin'].includes(szerep)) {
    return res.status(400).json({ error: 'Érvénytelen szerepkör.' });
  }
  try {
    const existingUser = dbGet('SELECT * FROM felhasznalok WHERE felhasznalonev = ?', [felhasznalonev]);
    if (existingUser) {
      return res.status(409).json({ error: 'A megadott felhasználónév már létezik.' });
    }

    const hashedPassword = await bcrypt.hash(jelszo, 10);
    const result = dbRun(
      'INSERT INTO felhasznalok (nev, felhasznalonev, jelszo, szerep) VALUES (?, ?, ?, ?)',
      [nev, felhasznalonev, hashedPassword, szerep]
    );
    res.status(201).json({
      id: result.lastInsertRowid,
      nev,
      felhasznalonev,
      szerep,
    });
  } catch (error) {
    console.error("Regisztrációs hiba:", error);
    res.status(500).json({ error: 'Szerverhiba történt a regisztráció során.' });
  }
});

// 2. POST /api/login - Bejelentkezés, JWT token generálása
app.post('/api/login', async (req, res) => {
  const { felhasznalonev, jelszo } = req.body;
  if (!felhasznalonev || !jelszo) {
    return res.status(400).json({ error: 'Felhasználónév és jelszó megadása kötelező.' });
  }
  try {
    const user = dbGet('SELECT * FROM felhasznalok WHERE felhasznalonev = ?', [felhasznalonev]);
    if (!user) {
      return res.status(401).json({ error: 'Hibás felhasználónév vagy jelszó.' });
    }
    const validPassword = await bcrypt.compare(jelszo, user.jelszo);
    if (!validPassword) {
      return res.status(401).json({ error: 'Hibás felhasználónév vagy jelszó.' });
    }
    const accessTokenPayload = {
      id: user.id,
      felhasznalonev: user.felhasznalonev,
      szerep: user.szerep
    };
    const token = jwt.sign(accessTokenPayload, JWT_SECRET, { expiresIn: '1h' }); // Token lejár 1 óra múlva
    res.json({ token });
  } catch (error) {
    console.error("Bejelentkezési hiba:", error);
    res.status(500).json({ error: 'Szerverhiba történt a bejelentkezés során.' });
  }
});

// 3. GET /api/profil - Saját felhasználói adatok lekérdezése
app.get('/api/profil', authenticateToken, async (req, res) => {
  try {
    const userProfile = dbGet('SELECT id, nev, felhasznalonev, szerep FROM felhasznalok WHERE id = ?', [req.user.id]);
    if (!userProfile) {
      return res.status(404).json({ error: "Felhasználó nem található." });
    }
    res.json(userProfile);
  } catch (error) {
    console.error("Profil lekérdezési hiba:", error);
    res.status(500).json({ error: 'Szerverhiba történt a profiladatok lekérdezése során.' });
  }
});

// 4. GET /api/hibak - Hibák listázása
app.get('/api/hibak', authenticateToken, async (req, res) => {
  const { allapot } = req.query;
  let sql = 'SELECT * FROM hibak';
  const params = [];

  if (allapot) {
    if (['bejelentve', 'kijavítva'].includes(allapot)) {
      sql += ' WHERE allapot = ?';
      params.push(allapot);
    } else {
      return res.status(400).json({ error: 'Érvénytelen "allapot" paraméter.' });
    }
  }
  sql += ' ORDER BY datum DESC, id DESC'; // Legfrissebbek elöl
  try {
    const hibak = dbAll(sql, params);
    res.json(hibak);
  } catch (error) {
    console.error("Hibák listázási hiba:", error);
    res.status(500).json({ error: 'Szerverhiba történt a hibák listázása során.' });
  }
});

// 5. GET /api/hibak/:id - Egyedi hiba adatainak lekérdezése
app.get('/api/hibak/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const hiba = dbGet('SELECT * FROM hibak WHERE id = ?', [id]);
    if (!hiba) {
      return res.status(404).json({ error: 'A megadott ID-val nem létezik hiba.' });
    }
    res.json(hiba);
  } catch (error) {
    console.error("Egyedi hiba lekérdezési hiba:", error);
    res.status(500).json({ error: 'Szerverhiba történt a hiba lekérdezése során.' });
  }
});

// 6. POST /api/hibak - Új hiba bejelentése (csak tanároknak és adminnak)
app.post('/api/hibak', authenticateToken, async (req, res) => {
  const { terem, leiras } = req.body;
  const currentUser = req.user;

  // Jogosultság ellenőrzés: csak tanár vagy admin rögzíthet új hibát
  if (currentUser.szerep !== 'tanar' && currentUser.szerep !== 'admin') {
    return res.status(403).json({ error: 'Nincs jogosultsága ehhez a művelethez.' });
  }
  const bejelento_id = currentUser.id; // JWT-ből
  const datum = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const allapot = 'bejelentve';
  if (!terem || !leiras) {
    return res.status(400).json({ error: 'A terem és a leírás megadása kötelező.' });
  }
  try {
    const result = dbRun(
      'INSERT INTO hibak (datum, bejelento_id, terem, leiras, allapot) VALUES (?, ?, ?, ?, ?)',
      [datum, bejelento_id, terem, leiras, allapot]
    );
    const ujHiba = dbGet('SELECT * FROM hibak WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(ujHiba);
  } catch (error) {
    console.error("Új hiba rögzítési hiba:", error);
    res.status(500).json({ error: 'Szerverhiba történt a hiba rögzítése során.' });
  }
});

// 7. PUT /api/hibak/:id - Hiba adatainak szerkesztése (bejelentő/admin, ha „bejelentve”)
app.put('/api/hibak/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { terem, leiras } = req.body;
  const currentUser = req.user;

  if (!terem || !leiras) {
    return res.status(400).json({ error: 'A terem és a leírás megadása kötelező a módosításhoz.' });
  }
  try {
    const hiba = dbGet('SELECT * FROM hibak WHERE id = ?', [id]);
    if (!hiba) {
      return res.status(404).json({ error: 'A megadott ID-val nem létezik hiba.' });
    }
    if (hiba.allapot === 'kijavítva') {
      return res.status(400).json({ error: 'Kijavított hiba nem szerkeszthető.' });
    }
    // Jogosultság ellenőrzés: csak a bejelentő vagy admin módosíthat
    if (currentUser.szerep !== 'admin' && hiba.bejelento_id !== currentUser.id) {
      return res.status(403).json({ error: 'Nincs jogosultsága ennek a hibának a szerkesztéséhez.' });
    }
    dbRun(
      'UPDATE hibak SET terem = ?, leiras = ? WHERE id = ?',
      [terem, leiras, id]
    );
    const frissitettHiba = dbGet('SELECT * FROM hibak WHERE id = ?', [id]);
    res.json(frissitettHiba);

  } catch (error) {
    console.error("Hiba szerkesztési hiba:", error);
    res.status(500).json({ error: 'Szerverhiba történt a hiba szerkesztése során.' });
  }
});

// 8. PUT /api/hibak/:id/javitas - Hiba kijavítottra állítása (karbantartó/admin)
app.put('/api/hibak/:id/javitas', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;
  const javitas_datuma = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const allapot = 'kijavítva';

  // Jogosultság ellenőrzés: csak karbantartó vagy admin állíthatja kijavítottra
  if (currentUser.szerep !== 'karbantarto' && currentUser.szerep !== 'admin') {
    return res.status(403).json({ error: 'Nincs jogosultsága ehhez a művelethez.' });
  }
  const javito_id = currentUser.id; // JWT-ből
  try {
    const hiba = dbGet('SELECT * FROM hibak WHERE id = ?', [id]);
    if (!hiba) {
      return res.status(404).json({ error: 'A megadott ID-val nem létezik hiba.' });
    }
    if (hiba.allapot === 'kijavítva') {
      return res.status(409).json({ error: 'A hiba már ki van javítva.' });
    }
    dbRun(
      'UPDATE hibak SET allapot = ?, javito_id = ?, javitas_datuma = ? WHERE id = ?',
      [allapot, javito_id, javitas_datuma, id]
    );
    const frissitettHiba = dbGet('SELECT * FROM hibak WHERE id = ?', [id]);
    res.json(frissitettHiba);

  } catch (error) {
    console.error("Hiba javítási hiba:", error);
    res.status(500).json({ error: 'Szerverhiba történt a hiba javítása során.' });
  }
});

// Szerver indítása
app.listen(PORT, () => {
  console.log(`A szerver fut a http://localhost:${PORT} címen`);
});

// Adatbázis kapcsolat bezárása a program leállásakor
function gracefulShutdown() {
  if (db) {
    db.close();
    console.log('Adatbázis kapcsolat bezárva.');
  }
  process.exit(0);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
