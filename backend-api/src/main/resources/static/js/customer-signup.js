document.addEventListener('DOMContentLoaded', function () {
    // Find the signup form on the page
    const form = document.getElementById('signupForm');

    if (!form) {
        console.error('Signup form not found');
        return;
    }

    // Handle form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent default form submission

        // Get form values and clean them up
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const address = document.getElementById('address').value.trim();

        // Validate required fields
        if (!name) {
            document.getElementById('name').focus();
            return;
        }

        if (!email) {
            document.getElementById('email').focus();
            return;
        }

        if (!password) {
            document.getElementById('password').focus();
            return;
        }

        // Check password length
        if (password.length < 6) {
            document.getElementById('password').focus();
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            document.getElementById('confirmPassword').focus();
            return;
        }

        if (!phoneNumber) {
            document.getElementById('phoneNumber').focus();
            return;
        }

        if (!address) {
            document.getElementById('address').focus();
            return;
        }

        // Validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            document.getElementById('email').focus();
            return;
        }

        // Prepare customer data for backend
        const customerData = {
            name: name,
            email: email.toLowerCase(),
            password: password,
            phoneNumber: phoneNumber,
            address: address,
            identifier: email.toLowerCase()
        };

        try {
            // Send signup request to backend
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
            });

            if (response.ok) {
                // Signup successful
                const customer = await response.json();
                
                // Store customer info in browser for session management
                
                localStorage.setItem('customerId', customer.id);
                localStorage.setItem('customerName', customer.name);
                localStorage.setItem('customerEmail', customer.email);
                localStorage.setItem('chillcrib_customer_auth', 'true');

                // Redirect to dashboard after successful signup
                window.location.href = 'customer-dashboard.html';
            } else {
                // Handle signup errors
                let errorMessage = 'Failed to create account. Please try again.';

                try {
                    // Try to get specific error message from response
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch (parseError) {
                    // If JSON parsing fails, check response text
                    const errorText = await response.text();
                    
                    // Handle common error cases
                    if (response.status === 409 || errorText.includes('already registered') || errorText.includes('duplicate')) {
                        errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
                    } else if (response.status === 400) {
                        errorMessage = 'Invalid information provided. Please check all fields and try again.';
                    }
                }

                console.error('Signup failed:', errorMessage);
            }
        } catch (error) {
            // Handle network or other errors
            console.error('Network error:', error);
        }
    });
});

