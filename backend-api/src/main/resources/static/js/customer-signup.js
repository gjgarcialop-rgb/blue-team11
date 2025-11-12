// Customer Signup JavaScript with Fetch API
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };
    
    try {
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
            localStorage.setItem('customerName', customer.firstName + ' ' + customer.lastName);
            
            alert('Account created successfully! Welcome to ChillCrib!');
            window.location.href = 'customer-dashboard.html';
        } else {
            const errorText = await response.text();
            console.error('Error creating customer:', errorText);
            alert('Error creating account: ' + errorText);
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error. Please try again.');
    }
});