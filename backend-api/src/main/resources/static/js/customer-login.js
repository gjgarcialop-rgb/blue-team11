// Customer Login JavaScript with Fetch API
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    
    try {
        // GET request to find customer by email
        const response = await fetch(`/api/customers/search/email?email=${encodeURIComponent(email)}`);
        
        if (response.ok) {
            const customers = await response.json();
            
            if (customers.length > 0) {
                const customer = customers[0];
                
                // Store customer info in localStorage
                localStorage.setItem('customerId', customer.id);
                localStorage.setItem('customerName', customer.firstName + ' ' + customer.lastName);
                
                alert('Login successful! Welcome back to ChillCrib!');
                window.location.href = 'customer-dashboard.html';
            } else {
                alert('No customer found with this email. Please sign up first.');
            }
        } else {
            alert('Error during login. Please try again.');
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error. Please try again.');
    }
});