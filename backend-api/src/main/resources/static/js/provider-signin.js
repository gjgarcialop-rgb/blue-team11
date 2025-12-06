document.getElementById('signinForm').addEventListener('submit', async function(e) {

  e.preventDefault(); // Prevent default form submission


const loginData= {
  email: document.getElementById('email').value.trim().toLowerCase(),
  password: document.getElementById('password').value
};

if (!loginData.email || !loginData.password) {
  console.log('Email and password required');
  return;
}



try {
  const response = await fetch('/api/providers/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData)
  });

  if(response.ok) {
    const provider = await response.json();
    console.log('Provider signed in successfully:', provider);

    localStorage.setItem('providerId', provider.id);
    localStorage.setItem('providerName', provider.name);
    localStorage.setItem('providerEmail', provider.email);
    localStorage.setItem('providerPhone', provider.phoneNumber || '');
    localStorage.setItem('providerAddress', provider.address || '');
    
    // Redirects this  to the provider dashboard after successful signin
    window.location.href = 'provider-dashboard.html';

  } else if (response.status === 401) {
    console.log('Invalid email or password');
  } else if (response.status === 404) {
    console.log('No account found with this email');
    window.location.href = 'provider-signup.html';

  } else {

    const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
    console.error('Login error:', errorData);

  }


  } catch (error) {
    console.error('Signin error:', error);
  }

});


























