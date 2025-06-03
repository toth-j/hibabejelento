// script.js
const API_BASE_URL = 'http://localhost:3000/api'; // Backend API címe

document.addEventListener('DOMContentLoaded', () => {
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
        loadUserProfile();
        loadFaults();

        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) logoutButton.addEventListener('click', handleLogout);

        // Jogosultság alapján engedélyezzük az új hiba gombot (lásd loadUserProfile)

        const newFaultForm = document.getElementById('newFaultForm');
        if (newFaultForm) newFaultForm.addEventListener('submit', handleNewFaultSubmit);

        const filterStatus = document.getElementById('filterStatus');
        if (filterStatus) filterStatus.addEventListener('change', () => loadFaults(filterStatus.value));

        const editFaultForm = document.getElementById('editFaultForm');
        if (editFaultForm) editFaultForm.addEventListener('submit', handleEditFaultSubmit);

        const markAsFixedButton = document.getElementById('markAsFixedButton');
        if (markAsFixedButton) markAsFixedButton.addEventListener('click', handleMarkAsFixed);
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

let currentUserProfile = null;

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
        row.insertCell().textContent = fault.bejelento_id;
        row.insertCell().textContent = fault.javito_id || '-';
        row.insertCell().textContent = fault.javitas_datuma || '-';

        const actionsCell = row.insertCell();
        const viewButton = document.createElement('button');
        viewButton.classList.add('btn', 'btn-sm', 'btn-info');
        viewButton.textContent = 'Részletek';
        viewButton.onclick = () => openFaultDetailModal(fault.id);
        actionsCell.appendChild(viewButton);
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

async function openFaultDetailModal(faultId) {
    const token = sessionStorage.getItem('authToken');
    if (!token || !currentUserProfile) return;

    try {
        const response = await fetch(`${API_BASE_URL}/hibak/${faultId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            alert('Hiba a részletek lekérdezésekor.');
            return;
        }
        const fault = await response.json();

        document.getElementById('editFaultId').value = fault.id;
        document.getElementById('editTerem').value = fault.terem;
        document.getElementById('editLeiras').value = fault.leiras;
        document.getElementById('detailAllapot').textContent = fault.allapot;
        document.getElementById('detailBejelentoDatum').textContent = fault.datum;
        document.getElementById('detailBejelentoId').textContent = fault.bejelento_id;

        const javitasInfoContainer = document.getElementById('javitasInfoContainer');
        if (fault.allapot === 'kijavítva' && fault.javito_id) {
            document.getElementById('detailJavitoId').textContent = fault.javito_id;
            document.getElementById('detailJavitasDatum').textContent = fault.javitas_datuma;
            javitasInfoContainer.style.display = 'block';
        } else {
            javitasInfoContainer.style.display = 'none';
        }

        const saveButton = document.getElementById('saveFaultChangesButton');
        const fixButton = document.getElementById('markAsFixedButton');
        const editTeremInput = document.getElementById('editTerem');
        const editLeirasInput = document.getElementById('editLeiras');

        // Szerkesztés engedélyezése
        if (fault.allapot === 'bejelentve' && (currentUserProfile.szerep === 'admin' || currentUserProfile.id === fault.bejelento_id)) {
            saveButton.disabled = false;
            editTeremInput.readOnly = false;
            editLeirasInput.readOnly = false;
        } else {
            saveButton.disabled = true;
            editTeremInput.readOnly = true;
            editLeirasInput.readOnly = true;
        }

        // Kijavítottra állítás engedélyezése
        if (fault.allapot === 'bejelentve' && (currentUserProfile.szerep === 'admin' || currentUserProfile.szerep === 'karbantarto')) {
            fixButton.disabled = false;
        } else {
            fixButton.disabled = true;
        }
        fixButton.dataset.faultId = fault.id; // Hozzáadjuk az ID-t a gombhoz

        const detailModal = new bootstrap.Modal(document.getElementById('faultDetailModal'));
        detailModal.show();

    } catch (error) {
        console.error('Hiba a hiba részleteinek lekérdezésekor:', error);
        alert('Hiba történt a részletek betöltésekor.');
    }
}


async function handleEditFaultSubmit(event) {
    event.preventDefault();
    const token = sessionStorage.getItem('authToken');
    const faultId = document.getElementById('editFaultId').value;
    const terem = document.getElementById('editTerem').value;
    const leiras = document.getElementById('editLeiras').value;
    const editFaultErrorDiv = document.getElementById('editFaultError');
    editFaultErrorDiv.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/hibak/${faultId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ terem, leiras })
        });
        const data = await response.json();
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('faultDetailModal')).hide();
            loadFaults(document.getElementById('filterStatus').value);
        } else {
            editFaultErrorDiv.textContent = data.error || 'Hiba történt a mentés során.';
        }
    } catch (error) {
        console.error('Hiba szerkesztési hiba:', error);
        editFaultErrorDiv.textContent = 'Hálózati hiba történt.';
    }
}

async function handleMarkAsFixed() {
    const token = sessionStorage.getItem('authToken');
    const faultId = this.dataset.faultId; // 'this' a gombra mutat, amire kattintottak
    if (!faultId) {
        console.error("Nincs faultId a 'Kijavítottra állítás' gombon.");
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
            bootstrap.Modal.getInstance(document.getElementById('faultDetailModal')).hide();
            loadFaults(document.getElementById('filterStatus').value);
        } else {
            alert(data.error || 'Hiba történt a kijavítottra állítás során.');
        }
    } catch (error) {
        console.error('Hiba javítási hiba:', error);
        alert('Hálózati hiba történt a kijavítottra állítás során.');
    }
}
