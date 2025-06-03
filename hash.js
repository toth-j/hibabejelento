const bcrypt = require('bcrypt');

async function hashPassword(plainPassword) {
  const saltRounds = 10; // a kérésed szerint
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log('Hash-elt jelszó:', hashedPassword);
  } catch (err) {
    console.error('Hiba történt a hash-elés során:', err);
  }
}

// Példa: hívások
hashPassword('Minad123');
hashPassword('kissp');
hashPassword('nagya');
hashPassword('szabob');
hashPassword('tothk');
