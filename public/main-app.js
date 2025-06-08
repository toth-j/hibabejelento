// main-app.js
const API_BASE_URL = 'http://localhost:3000/api';
let currentUserProfile = null;
let allUsersMap = new Map();

document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('authToken');
    // Ha nincs token, és a főoldalon vagyunk, átirányítunk a login oldalra
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    await loadUserProfile();
    if (currentUserProfile) {
        await fetchAllUsers();
        loadFaults();
    } else {
        // Ha a profil betöltése sikertelen (pl. lejárt token), a loadUserProfile már kezeli a kijelentkeztetést.
        console.log("Aktuális felhasználói profil nem töltődött be, hibák és egyéb adatok betöltése megszakítva.");
    }

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);

    const newFaultForm = document.getElementById('newFaultForm');
    if (newFaultForm) newFaultForm.addEventListener('submit', handleNewFaultSubmit);

    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) filterStatus.addEventListener('change', () => loadFaults(filterStatus.value));
});

function handleLogout() {
    sessionStorage.removeItem('authToken');
    window.location.replace('index.html');
}

async function loadUserProfile() {
    const token = sessionStorage.getItem('authToken');
    if (!token) return; // Ezt a DOMContentLoaded már ellenőrzi, de biztonsági okokból itt is maradhat

    try {
        const response = await fetch(`${API_BASE_URL}/profil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const user = await response.json();
            currentUserProfile = user;
            document.getElementById('userInfo').textContent = `Bejelentkezve: ${user.nev} (${user.szerep})`;

            const newFaultButton = document.getElementById('newFaultButton');
            if (newFaultButton && (user.szerep === 'tanar' || user.szerep === 'admin')) {
                newFaultButton.disabled = false;
            }
        } else {
            console.error('Profiladatok lekérdezése sikertelen.');
            if (response.status === 401 || response.status === 403) handleLogout();
        }
    } catch (error) {
        console.error('Hiba a profiladatok lekérdezésekor:', error);
        // Súlyosabb hálózati hiba esetén is érdemes lehet kijelentkeztetni
        // handleLogout();
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
                allUsersMap.set(user.id, user.felhasznalonev);
            });
        } else {
            console.error('Felhasználók lekérdezése sikertelen.');
            // Ha a felhasználók lekérdezése nem sikerül (pl. jogosultsági hiba),
            // az nem feltétlenül jelenti, hogy ki kell jelentkeztetni,
            // csak a nevek nem fognak megjelenni.
            // Ha a token érvénytelen, a loadUserProfile már kijelentkeztetett volna.
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
    tableBody.innerHTML = '';

    if (!faults || faults.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center">Nincsenek megjeleníthető hibák.</td></tr>`;
        return;
    }

    faults.forEach(fault => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = fault.datum;
        row.insertCell().textContent = fault.terem;
        row.insertCell().textContent = fault.leiras;
        row.insertCell().innerHTML = `<span class="badge bg-${fault.allapot === 'bejelentve' ? 'warning' : 'success'}">${fault.allapot}</span>`;
        row.insertCell().textContent = allUsersMap.get(fault.bejelento_id) || fault.bejelento_id;
        row.insertCell().textContent = fault.javito_id ? (allUsersMap.get(fault.javito_id) || fault.javito_id) : '-';
        row.insertCell().textContent = fault.javitas_datuma || '-';

        const actionsCell = row.insertCell();
        if (fault.allapot === 'bejelentve' && currentUserProfile &&
            (currentUserProfile.szerep === 'admin' || currentUserProfile.szerep === 'karbantarto')) {
            const markFixedButton = document.createElement('button');
            markFixedButton.classList.add('btn', 'btn-sm', 'btn-secondary');
            markFixedButton.textContent = 'Javítás';
            markFixedButton.onclick = () => handleMarkAsFixed(fault.id);
            actionsCell.appendChild(markFixedButton);
        } else {
            actionsCell.textContent = '-';
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
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ terem, leiras })
        });
        const data = await response.json();
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('newFaultModal')).hide();
            loadFaults(document.getElementById('filterStatus').value);
            document.getElementById('newFaultForm').reset();
        } else {
            newFaultErrorDiv.textContent = data.error || 'Hiba történt a mentés során.';
        }
    } catch (error) {
        console.error('Új hiba mentési hiba:', error);
        newFaultErrorDiv.textContent = 'Hálózati hiba történt.';
    }
}

async function handleMarkAsFixed(faultId) {
    const token = sessionStorage.getItem('authToken');
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
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
            loadFaults(document.getElementById('filterStatus').value);
        } else {
            alert(data.error || 'Hiba történt a kijavítottra állítás során.');
        }
    } catch (error) {
        console.error('Hiba javítási hiba:', error);
        alert('Hálózati hiba történt a kijavítottra állítás során.');
    }
}