// ChillCrib Customer Signup - Clean Backend Integration
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    
    if (!form) {
        console.error('Signup form not found');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const address = document.getElementById('address').value.trim();
        
        // Basic validation
        if (!name) {
            console.log('Name required');
            document.getElementById('name').focus();
            return;
        }
        
        if (!email) {
            console.log('Email required');
            document.getElementById('email').focus();
            return;
        }
        
        if (!password) {
            console.log('Password required');
            document.getElementById('password').focus();
            return;
        }
        
        if (password.length < 6) {
            console.log('Password must be at least 6 characters long');
            document.getElementById('password').focus();
            return;
        }
        
        if (password !== confirmPassword) {
            console.log('Passwords do not match');
            document.getElementById('confirmPassword').focus();
            return;
        }
        
        if (!phoneNumber) {
            console.log('Phone number required');
            document.getElementById('phoneNumber').focus();
            return;
        }
        
        if (!address) {
            console.log('Address required');
            document.getElementById('address').focus();
            return;
        }
        
        // Email format validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            console.log('Invalid email format');
            document.getElementById('email').focus();
            return;
        }
        
        // Create customer data object
        const customerData = {
            name: name,
            email: email.toLowerCase(),
            password: password,
            phoneNumber: phoneNumber,
            address: address,
            identifier: email.toLowerCase()
        };
        
        console.log('Submitting customer data:', customerData);
        
        try {
            // Submit to backend
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
            });
            
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const customer = await response.json();
                console.log('Account created:', customer);
                
                // Store customer info for session
                localStorage.setItem('customerId', customer.id);
                localStorage.setItem('customerName', customer.name);
                localStorage.setItem('customerEmail', customer.email);
                localStorage.setItem('chillcrib_customer_auth', 'true');
                
                // Redirect to dashboard
                window.location.href = 'customer-dashboard.html';
                
            } else {
                let errorMessage = 'Failed to create account. Please try again.';
                
                try {
                    const errorData = await response.json();
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (parseError) {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    
                    if (response.status === 409 || errorText.includes('already registered') || errorText.includes('duplicate')) {
                        errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
                    } else if (response.status === 400) {
                        errorMessage = 'Invalid information provided. Please check all fields and try again.';
                    }
                }
                
                console.error('Signup failed:', errorMessage);
                // Focus on relevant field instead of popup
            }
            
        } catch (error) {
            console.error('Network error:', error);
            // Log error instead of popup
        }
    });
});