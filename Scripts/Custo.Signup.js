// Customer Authentication - ChillCrib
// Backend Integration (updated to remove hardcoded credentials)

document.addEventListener('DOMContentLoaded', () => {
    console.log('Customer auth script loaded');
    
    // Check for signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        console.log('Signup form found, setting up handler');
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Signup form submission started');
            
            try {
                // Get form values
                const username = document.getElementById('username').value.trim();
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
                
                console.log('Signup form values:', { username, email, passwordLength: password.length });
                
                // Basic validation
                if (!username || !email || !password || !confirmPassword) {
                    alert('Please fill in all fields');
                    return;
                }
                
                if (password !== confirmPassword) {
                    alert('Passwords do not match');
                    return;
                }
                
                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    alert('Please enter a valid email address');
                    return;
                }
                
                if (password.length < 6) {
                    alert('Password must be at least 6 characters long');
                    return;
                }
                
                console.log('All validations passed, submitting to backend...');
                
                // Create customer object
                const customerData = {
                    name: username,
                    email: email,
                    password: password
                };
                
                // Send to backend
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
    }
    
    // Check for signin form (login)
    const signinForm = document.getElementById('signinForm') || document.getElementById('loginForm');
    if (signinForm) {
        console.log('Login form found, setting up handler');
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Login form submission started');
            
            try {
                // Get form values
                const identifier = document.getElementById('identifier').value.trim();
                const password = document.getElementById('password').value;
                
                console.log('Login form values:', { identifier, passwordLength: password.length });
                
                // Basic validation
                if (!identifier || !password) {
                    alert('Please fill in all fields');
                    return;
                }
                
                console.log('Validation passed, authenticating with backend...');
                
                // Create login request
                const loginData = {
                    identifier: identifier,
                    password: password
                };
                
                // Send to backend
                const response = await fetch('http://localhost:8080/api/customers/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });
                
                console.log('Backend response status:', response.status);
                
                if (response.ok) {
                    const customer = await response.json();
                    console.log('Login successful:', customer);
                    
                    // Store customer info in localStorage
                    localStorage.setItem('customerId', customer.id);
                    localStorage.setItem('customerName', customer.name);
                    localStorage.setItem('customerEmail', customer.email);
                    localStorage.setItem('chillcrib_customer_auth', 'true');
                    
                    alert('Login successful! Welcome back to ChillCrib!');
                    window.location.href = 'DashBoard.html';
                } else {
                    const errorData = await response.json().catch(() => ({ error: 'Invalid credentials' }));
                    console.error('Login failed:', errorData);
                    alert('Login failed: ' + (errorData.error || 'Invalid credentials'));
                }
                
            } catch (error) {
                console.error('Network or system error:', error);
                alert('Login failed. Please check your connection and try again.');
            }
        });
    }
});