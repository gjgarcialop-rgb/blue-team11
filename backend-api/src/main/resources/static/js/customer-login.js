// Customer Login JavaScript with Fetch API - Pure Backend Integration with Password Authentication
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data - NO hardcoded values
    const loginData = {
        email: document.getElementById('email').value.trim().toLowerCase(),
        password: document.getElementById('password').value
    };
    
    // Validate all fields are filled
    if (!loginData.email || !loginData.password) {
        console.log('Email and password required');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginData.email)) {
        console.log('Invalid email format');
        return;
    }
    
    try {
        // POST request to authenticate customer with password
        const response = await fetch('/api/customers/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        if (response.ok) {
            const customer = await response.json();
            console.log('Customer authenticated successfully:', customer);
            
            // Store customer info in localStorage for session management
            localStorage.setItem('customerId', customer.id);
            localStorage.setItem('customerName', customer.name);
            localStorage.setItem('customerEmail', customer.email);
            localStorage.setItem('customerPhone', customer.phoneNumber || '');
            localStorage.setItem('customerAddress', customer.address || '');
            
            // Redirect to dashboard
            window.location.href = 'customer-dashboard.html';
            
        } else if (response.status === 401) {
            console.log('Invalid email or password');
        } else if (response.status === 404) {
            console.log('No account found with this email');
            // Optional redirect to signup
            window.location.href = 'customer-signup.html';
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
            console.error('Login error:', errorData);
        }
        
    } catch (error) {
        console.error('Network error:', error);
        // Log error instead of popup
    }
});