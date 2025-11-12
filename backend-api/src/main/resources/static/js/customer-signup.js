// Customer Signup JavaScript with Fetch API - Pure Backend Integration
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data - NO hardcoded values, matches Customer entity structure
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        password: document.getElementById('password').value,
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        address: document.getElementById('address').value.trim(),
        identifier: document.getElementById('email').value.trim().toLowerCase() // Use email as identifier
    };
    
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate all fields are filled
    if (!formData.name || !formData.email || !formData.password || !confirmPassword || !formData.phoneNumber || !formData.address) {
        alert('Please fill in all fields');
        return;
    }
    
    // Validate passwords match
    if (formData.password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Validate password strength
    if (formData.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Validate phone format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
        alert('Please enter a valid phone number');
        return;
    }
    
    try {
        // Check if email already exists
        const checkResponse = await fetch(`/api/customers/email/${encodeURIComponent(formData.email)}`);
        if (checkResponse.ok) {
            alert('An account with this email already exists. Please log in instead.');
            window.location.href = 'customer-login.html';
            return;
        }
        
        // POST request to create new customer
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const customer = await response.json();
            console.log('Customer created successfully:', customer);
            
            // Store customer info in localStorage for session management
            localStorage.setItem('customerId', customer.id);
            localStorage.setItem('customerName', customer.name);
            localStorage.setItem('customerEmail', customer.email);
            
            alert(`Welcome to ChillCrib, ${customer.name}! Your account has been created successfully!`);
            
            // Redirect to profile page to complete setup
            window.location.href = 'customer-profile.html';
            
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('Error creating customer:', errorData);
            alert('Error creating account: ' + (errorData.message || 'Please try again'));
        }
        
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error. Please check your connection and try again.');
    }
});