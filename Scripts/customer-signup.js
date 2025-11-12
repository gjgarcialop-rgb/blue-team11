// Customer Signup - ChillCrib
// Backend Integration with comprehensive validation and debugging

document.addEventListener('DOMContentLoaded', () => {
    console.log('Customer signup script loaded');
    
    const form = document.getElementById('signupForm');
    if (!form) {
        console.error('Signup form not found');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submission started');
        
        try {
            // Get form values
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            console.log('Form values:', { username, email, passwordLength: password.length });
            
            // Step 1: Basic validation
            if (!username || !email || !password || !confirmPassword) {
                alert('Please fill in all fields');
                console.log('Validation failed: Empty fields');
                return;
            }
            
            // Step 2: Password confirmation
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                console.log('Validation failed: Password mismatch');
                return;
            }
            
            // Step 3: Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                console.log('Validation failed: Invalid email format');
                return;
            }
            
            // Step 4: Password strength
            if (password.length < 6) {
                alert('Password must be at least 6 characters long');
                console.log('Validation failed: Password too short');
                return;
            }
            
            console.log('All validations passed, submitting to backend...');
            
            // Step 5: Create customer object
            const customerData = {
                name: username,
                email: email,
                password: password
            };
            
            console.log('Sending data to backend:', { name: username, email, passwordSet: !!password });
            
            // Step 6: Send to backend
            const response = await fetch('http://localhost:8080/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(customerData)
            });
            
            console.log('Backend response status:', response.status);
            
            if (response.ok) {
                const customer = await response.json();
                console.log('Account created successfully:', customer);
                
                // Store customer info in localStorage
                localStorage.setItem('customerId', customer.id);
                localStorage.setItem('customerName', customer.name);
                localStorage.setItem('customerEmail', customer.email);
                localStorage.setItem('chillcrib_customer_auth', 'true');
                
                alert('Account created successfully! Welcome to ChillCrib!');
                window.location.href = 'DashBoard.html';
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('Backend error:', errorData);
                alert('Error creating account: ' + (errorData.error || 'Please try again'));
            }
            
        } catch (error) {
            console.error('Network or system error:', error);
            alert('Error creating account. Please check your connection and try again.');
        }
    });
});