document.addEventListener('DOMContentLoaded', async function () {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace('provider-signin.html');
        });
    }


    const providerId = localStorage.getItem('providerId');

    if (!providerId) {
        window.location.href = 'provider-signin.html';
        return;
    }

    try {
        await loadProviderProfile(providerId);
    } catch (error) {
        console.error('Failed to load the provider', error);
    }
});

async function loadProviderProfile(providerId) {
    try {
        const response = await fetch(`/api/providers/${providerId}`);
        if (response.ok) {
            const provider = await response.json();

            if (!provider.id || !provider.email) {
                throw new Error('no provider data found.');
            }

            localStorage.setItem('providerName', provider.name);
            localStorage.setItem('providerEmail', provider.email);

            // Populate form fields
            document.getElementById('name').value = provider.name || '';
            document.getElementById('email').value = provider.email || '';
            document.getElementById('phoneNumber').value = provider.phoneNumber || '';
            document.getElementById('address').value = provider.address || '';

        } else if (response.status === 404) {
            // alert removed
            localStorage.clear();
            window.location.href = 'provider-signup.html';
        } else {
            throw new Error(`Server error: ${response.status}`);
        }
    } catch (error) {
        console.error('Error loading provider profile:', error);
    }
}

document.getElementById('profile-update-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const providerId = localStorage.getItem('providerId');

    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        address: document.getElementById('address').value.trim(),
        identifier: document.getElementById('email').value.trim().toLowerCase()
    };

    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.address) {
        showErrorMessage('Please fill in all fields');
        return;
    }

    // Check if email is being changed
    const currentEmail = localStorage.getItem('providerEmail');
    if (formData.email !== currentEmail) {
        try {
            const checkResponse = await fetch(`/api/providers/email/${encodeURIComponent(formData.email)}`);
            if (checkResponse.ok) {
                const existingProvider = await checkResponse.json();
                if (existingProvider && existingProvider.id != providerId) {
                    showErrorMessage('This email is already in use, please try another one.');
                    return;
                }
            }
        } catch (error) {
            console.error('Error while checking email:', error);
            return;
        }
    }

    try {
        const response = await fetch(`/api/providers/${providerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...formData, id: parseInt(providerId) })
        });

        if (response.ok) {
            const updatedProvider = await response.json();
            localStorage.setItem('providerName', updatedProvider.name);
            localStorage.setItem('providerEmail', updatedProvider.email);


        } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('Error updating profile:', errorData);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
    }
});



