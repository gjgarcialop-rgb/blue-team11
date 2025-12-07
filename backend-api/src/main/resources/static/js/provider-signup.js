document.querySelector('#signupForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName')?.value.trim();
    const lastName = document.getElementById('lastName')?.value.trim();
    const email = document.getElementById('email')?.value.trim().toLowerCase();
    const phoneNumber = document.getElementById('phoneNumber')?.value.trim();
    const address = document.getElementById('address')?.value.trim();
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('re-enter-password')?.value;

    //These are the statements for validation of sensitive information.

    if(!firstName || !lastName || !email || !phoneNumber || !address || !password || !confirmPassword){
        console.log('All fields are required.');
        return;
    }

    if(password !== confirmPassword){
        console.log('Passwords do not match.');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }

    const signupData = {
        name: `${firstName} ${lastName}`,
        email: email,
        phoneNumber: phoneNumber,
        address: address,
        password: password,
        identifier: email
    };

    try {
        const response = await fetch('/api/providers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(signupData)
        });

        if (response.ok) {
            const provider = await response.json();
            
            console.log('Provider signed up successfully:', provider);

            localStorage.setItem('providerId', provider.id);
            localStorage.setItem('providerName', provider.name);
            localStorage.setItem('providerEmail', provider.email);

            alert('Signup successful! Redirecting to dashboard...');

            setTimeout(() => {
                window.location.href = 'provider-dashboard.html';
            }, 3000);

        } else {
            console.log('Failed to sign up provider.');
        }
    } catch (error) {
        console.error('Error during sign up:', error);
        alert('An error has occurred during sign up. Please try again later.');
    }
});