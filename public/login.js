// login.js
const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('authToken');
    // Ha van token, és a login oldalon vagyunk, átirányítunk a főoldalra
    if (token) {
        window.location.href = 'main.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
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