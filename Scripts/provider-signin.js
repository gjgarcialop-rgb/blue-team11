// Very small static prototype login (NOT secure). Change USER/PASS as needed.
const PROVIDER_EMAIL1 = 'provider1@gmail.com';
const PROVIDER_USER1 = 'provider1';
const PROVIDER_PASS1 = 'Provider123';

const PROVIDER_EMAIL2 = 'provider2@gmail.com'
const PROVIDER_USER2 = 'provider2';
const PROVIDER_PASS2 = 'Provider123';
const AUTH_KEY = 'chillcrib_provider_auth';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signinForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('identifier')?.value.trim() || '';
    const pw = document.getElementById('password')?.value || '';
    if (id === PROVIDER_USER1 && pw === PROVIDER_PASS1 || id === PROVIDER_EMAIL1 && pw === PROVIDER_PASS1) {
      localStorage.setItem(AUTH_KEY, 'true');
      // redirect to provider landing
      window.location.href = 'provider-dashboard.html';
    } else if (id === PROVIDER_USER2 && pw === PROVIDER_PASS2 || id === PROVIDER_EMAIL2 && pw === PROVIDER_PASS2) {
      localStorage.setItem(AUTH_KEY, 'true');
      // redirect to provider landing
      window.location.href = 'provider-dashboard.html';
    }
    else {
      alert('Invalid credentials. Try again.');
    }



  });
});