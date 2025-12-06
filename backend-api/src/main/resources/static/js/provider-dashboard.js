document.addEventListener('DOMContentLoaded', async function () {
    const providerId = localStorage.getItem('providerId');

    if (!providerId) {
        window.location.href = 'provider-signin.html';
        return;
    }

});
