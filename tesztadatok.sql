-- Felhasználók tábla
CREATE TABLE felhasznalok (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nev TEXT NOT NULL,
  felhasznalonev TEXT UNIQUE NOT NULL,
  jelszo TEXT NOT NULL,
  szerep TEXT NOT NULL
);

-- Hibabejelentések tábla
CREATE TABLE hibak (
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

INSERT INTO felhasznalok (nev, felhasznalonev, jelszo, szerep) VALUES
  ('Admin', 'admin', '$2b$10$D.nfa/055qYTIVjNAhqFEeTnVS6rcXJRVCArjIn3XNMvb7PjnHN7u', 'admin'),
  ('Kiss Péter', 'kissp', '$2b$10$65zLhi8AuHynWshFrdX1hO.uxe.diUVWKYn41uLsNbon0UGJkzVDq', 'tanar'),
  ('Nagy Anna', 'nagya', '$2b$10$2neLOnOzv9Q8ukcSd0uUIuPTVz6reafP0QrhFhUOMTrm838Tyyme6', 'tanar'),
  ('Szabó Béla', 'szabob', '$2b$10$SPpHXOTCu8JzkfQ2KO8m1ukuRWKEPo3vwqkPZUs9IqTRK9rWu6pYi', 'karbantarto'),
  ('Tóth Károly', 'tothk', '$2b$10$aa0hZFBPQWa6p65QJNMg../YKNoAMLr1IS3zT4kgb1BBF.bk14U82', 'karbantarto');

INSERT INTO hibak (datum, bejelento_id, terem, leiras, allapot, javito_id, javitas_datuma) VALUES
  ('2025-06-01', 1, '101-es terem', 'Eltört egy szék.', 'bejelentve', NULL, NULL),
  ('2025-06-01', 2, 'Folyosó', 'A folyosón nem ég a lámpa.', 'bejelentve', NULL, NULL),
  ('2025-05-30', 1, '201-es terem', 'A projektor nem működik.', 'kijavítva', 4, '2025-05-31'),
  ('2025-05-28', 2, 'Tanári', 'Csöpög a csap.', 'kijavítva', 5, '2025-05-29'),
  ('2025-06-02', 1, 'Könyvtár', 'Eltört polc.', 'bejelentve', NULL, NULL);