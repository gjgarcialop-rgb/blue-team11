const CUSTOMER_EMAIL1 = 'customer1@gmail.com';
const CUSTOMER_USER1 = 'customer1';
const CUSTOMER_PASS1 = 'Customer123';

const CUSTOMER_EMAIL2 = 'customer2@gmail.com';
const CUSTOMER_USER2 = 'customer2';
const CUSTOMER_PASS2 = 'Customer123';
const AUTH_KEY = 'chillcrib_customer_auth';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signinForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('identifier')?.value.trim() || '';
        const pw = document.getElementById('password')?.value || '';
        if ((id === CUSTOMER_USER1 && pw === CUSTOMER_PASS1) || (id === CUSTOMER_EMAIL1 && pw === CUSTOMER_PASS1)) {
            localStorage.setItem(AUTH_KEY, 'true');
            window.location.href = 'DashBoard.html';
        } else if ((id === CUSTOMER_USER2 && pw === CUSTOMER_PASS2) || (id === CUSTOMER_EMAIL2 && pw === CUSTOMER_PASS2)) {
            localStorage.setItem(AUTH_KEY, 'true');
            window.location.href = 'DashBoard.html';
        } else {
            alert('Invalid credentials. Try again.');
        }



    });
});