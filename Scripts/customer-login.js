// Customer Login - ChillCrib
// Backend Integration with authentication

document.addEventListener('DOMContentLoaded', () => {
    console.log('Customer login script loaded');
    
    const form = document.getElementById('loginForm');
    if (!form) {
        console.error('Login form not found');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Login form submission started');
        
        try {
            // Get form values
            const identifier = document.getElementById('identifier').value.trim();
            const password = document.getElementById('password').value;
            
            console.log('Form values:', { identifier, passwordLength: password.length });
            
            // Basic validation
            if (!identifier || !password) {
                alert('Please fill in all fields');
                console.log('Validation failed: Empty fields');
                return;
            }
            
            console.log('Validation passed, authenticating with backend...');
            
            // Create login request
            const loginData = {
                identifier: identifier,
                password: password
            };
            
            console.log('Sending login request to backend');
            
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
});