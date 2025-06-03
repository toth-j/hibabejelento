// script.js
const API_BASE_URL = 'http://localhost:3000/api'; // Backend API címe
let currentUserProfile = null; // Globális változó a felhasználói profil tárolására
let allUsersMap = new Map(); // Globális Map a felhasználói ID-k és nevek tárolására

document.addEventListener('DOMContentLoaded', async () => { // Async a loadUserProfile await miatt
    const token = sessionStorage.getItem('authToken');
    const currentPage = window.location.pathname.split("/").pop() || 'index.html'; // Alapértelmezett az index.html, ha üres az elérési út

    if (currentPage === 'index.html') {
        if (token) {
            window.location.href = 'main.html'; // Ha van token, irányítsd át a főoldalra
            return; // Kilépés a DOMContentLoaded callbackből
        }
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    } else if (currentPage === 'main.html') {
        if (!token) {
            window.location.href = 'index.html'; // Ha nincs token, irányítsd át a login oldalra
            return; // Kilépés a DOMContentLoaded callbackből
        }
        await loadUserProfile(); // Megvárjuk az aktuális felhasználó profiljának betöltését
        if (currentUserProfile) { // Csak akkor töltjük be a hibákat, ha a profil sikeresen betöltődött
            await fetchAllUsers(); // Lekérdezzük az összes felhasználót a nevek megjelenítéséhez
            loadFaults();
        } else {
            console.log("Aktuális felhasználói profil nem töltődött be, hibák és egyéb adatok betöltése megszakítva.");
        }

        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) logoutButton.addEventListener('click', handleLogout);

        // Jogosultság alapján engedélyezzük az új hiba gombot (lásd loadUserProfile)

        const newFaultForm = document.getElementById('newFaultForm');
        if (newFaultForm) newFaultForm.addEventListener('submit', handleNewFaultSubmit);

        const filterStatus = document.getElementById('filterStatus');
        if (filterStatus) filterStatus.addEventListener('change', () => loadFaults(filterStatus.value));

        // Az editFaultForm és a modal-beli markAsFixedButton eseménykezelői eltávolítva, mivel a modal megszűnt.
        // A "Kijavítva" gombok eseménykezelése a renderFaults függvényben történik.
    }
});

async function handleLogin(event) {
    event.preventDefault();
    const felhasznalonev = document.getElementById('felhasznalonev').value;
    const jelszo = document.getElementById('jelszo').value;
    const loginErrorDiv = document.getElementById('loginError');
    loginErrorDiv.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ felhasznalonev, jelszo })
        });
        const data = await response.json();
        if (response.ok) {
            sessionStorage.setItem('authToken', data.token);
            window.location.href = 'main.html';
        } else {
            loginErrorDiv.textContent = data.error || 'Sikertelen bejelentkezés.';
        }
    } catch (error) {
        console.error('Bejelentkezési hiba:', error);
        loginErrorDiv.textContent = 'Hálózati hiba történt.';
    }
}

function handleLogout() {
    sessionStorage.removeItem('authToken');
    window.location.href = 'index.html';
}

async function loadUserProfile() {
    const token = sessionStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/profil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const user = await response.json();
            currentUserProfile = user;
            document.getElementById('userInfo').textContent = `Bejelentkezve: ${user.nev} (${user.szerep})`;

            // Új hiba gomb engedélyezése tanár vagy admin esetén
            const newFaultButton = document.getElementById('newFaultButton');
            if (user.szerep === 'tanar' || user.szerep === 'admin') {
                newFaultButton.disabled = false;
            }

        } else {
            console.error('Profiladatok lekérdezése sikertelen.');
            if (response.status === 401 || response.status === 403) handleLogout(); // Token hiba esetén kijelentkeztetés
        }
    } catch (error) {
        console.error('Hiba a profiladatok lekérdezésekor:', error);
    }
}

async function fetchAllUsers() {
    const token = sessionStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/felhasznalok`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const users = await response.json();
            users.forEach(user => {
                allUsersMap.set(user.id, user.felhasznalonev); // Felhasználónév tárolása ID alapján
            });
        } else {
            console.error('Felhasználók lekérdezése sikertelen.');
            if (response.status === 401 || response.status === 403) handleLogout();
        }
    } catch (error) {
        console.error('Hiba a felhasználók lekérdezésekor:', error);
    }
}


async function loadFaults(statusFilter = '') {
    const token = sessionStorage.getItem('authToken');
    if (!token) return;

    let url = `${API_BASE_URL}/hibak`;
    if (statusFilter) {
        url += `?allapot=${statusFilter}`;
    }

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const faults = await response.json();
            renderFaults(faults);
        } else {
            console.error('Hibák lekérdezése sikertelen.');
            if (response.status === 401 || response.status === 403) handleLogout();
        }
    } catch (error) {
        console.error('Hiba a hibák lekérdezésekor:', error);
    }
}

function renderFaults(faults) {
    const tableBody = document.getElementById('faultsTableBody');
    tableBody.innerHTML = ''; // Táblázat ürítése

    if (!faults || faults.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Nincsenek megjeleníthető hibák.</td></tr>';
        return;
    }

    faults.forEach(fault => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = fault.id;
        row.insertCell().textContent = fault.datum;
        row.insertCell().textContent = fault.terem;
        row.insertCell().textContent = fault.leiras;
        row.insertCell().innerHTML = `<span class="badge bg-${fault.allapot === 'bejelentve' ? 'warning' : 'success'}">${fault.allapot}</span>`;
        row.insertCell().textContent = allUsersMap.get(fault.bejelento_id) || fault.bejelento_id; // Bejelentő neve vagy ID
        row.insertCell().textContent = fault.javito_id ? (allUsersMap.get(fault.javito_id) || fault.javito_id) : '-'; // Javító neve vagy ID, ha van
        row.insertCell().textContent = fault.javitas_datuma || '-';

        const actionsCell = row.insertCell();
        const viewButton = document.createElement('button');

        // "Kijavítva" gomb hozzáadása, ha releváns
        if (fault.allapot === 'bejelentve' && currentUserProfile &&
            (currentUserProfile.szerep === 'admin' || currentUserProfile.szerep === 'karbantarto')) {
            const markFixedButton = document.createElement('button');
            markFixedButton.classList.add('btn', 'btn-sm', 'btn-secondary');
            markFixedButton.textContent = 'Kijavítva';
            markFixedButton.onclick = () => handleMarkAsFixed(fault.id); // Közvetlen hívás fault.id-val
            actionsCell.appendChild(markFixedButton);
        } else {
            actionsCell.textContent = '-'; // Ha nincs művelet
        }
    });
}

async function handleNewFaultSubmit(event) {
    event.preventDefault();
    const token = sessionStorage.getItem('authToken');
    const terem = document.getElementById('newTerem').value;
    const leiras = document.getElementById('newLeiras').value;
    const newFaultErrorDiv = document.getElementById('newFaultError');
    newFaultErrorDiv.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/hibak`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ terem, leiras })
        });
        const data = await response.json();
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('newFaultModal')).hide();
            loadFaults(document.getElementById('filterStatus').value); // Frissítjük a listát
            document.getElementById('newFaultForm').reset();
        } else {
            newFaultErrorDiv.textContent = data.error || 'Hiba történt a mentés során.';
        }
    } catch (error) {
        console.error('Új hiba mentési hiba:', error);
        newFaultErrorDiv.textContent = 'Hálózati hiba történt.';
    }
}

// Az openFaultDetailModal függvény eltávolítva, mivel a részletes nézet modal megszűnt.

// A handleEditFaultSubmit függvény eltávolítva, mivel a szerkesztési funkció megszűnt.

async function handleMarkAsFixed(faultId) { // faultId paraméterként érkezik
    const token = sessionStorage.getItem('authToken');
    // const faultId = this.dataset.faultId; // Eltávolítva, faultId paraméterből jön

    if (!faultId) {
        console.error("Nincs faultId a 'Kijavítottra állítás' művelethez.");
        return;
    }

    if (!confirm(`Biztosan kijavítottra állítod a(z) ${faultId}. azonosítójú hibát?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/hibak/${faultId}/javitas`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
            // Nincs body, a backend kezeli a javító ID-t és dátumot
        });
        const data = await response.json();
        if (response.ok) {
            // A modal bezárása itt már nem szükséges, mivel nincs modal.
            loadFaults(document.getElementById('filterStatus').value); // Frissítjük a listát
        } else {
            alert(data.error || 'Hiba történt a kijavítottra állítás során.');
        }
    } catch (error) {
        console.error('Hiba javítási hiba:', error);
        alert('Hálózati hiba történt a kijavítottra állítás során.');
    }
}
