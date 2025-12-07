document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.clear();
  window.location.href = 'provider-signin.html';
});




document.addEventListener('DOMContentLoaded', async function () {
    const providerId = localStorage.getItem('providerId');

    if (!providerId) {
        window.location.href = 'provider-signin.html';
        return;
    }

    console.log('logged in as provider with ID:', providerId);
    await loadProviderProperties(providerId);
});

async function loadProviderProperties(providerId) {
    try{
        const res = await fetch(`/api/properties/provider/${providerId}`);

        if(!res.ok){
            console.error('Failed to fetch properties for provider:', res.status);
            return;

        }

        const properties = await res.json();
        renderProperties(properties);


    }catch (err){
        console.error('Error fetching provider properties:', err);
    }
}

function renderProperties(properties) {
    const container = document.querySelector('.listing-card');
    if (!container) {
        return;
    }

    container.querySelectorAll('.listing-card-inside').forEach(el => el.remove());

    if(!properties || properties.length === 0){ 

        const message = document.createElement('p');
        message.textContent = 'No properties found.';
        container.appendChild(message);
        return;
    }

    const randomProperty = properties[Math.floor(Math.random() * properties.length)];

    const insideBox = document.createElement('div');
    insideBox.className = 'listing-card-inside';

    const title = document.createElement('h3');
    title.textContent = randomProperty.title || 'Untitled Property';
    insideBox.appendChild(title);

    const meta = document.createElement('p');
    const price = randomProperty.pricePerNight ? `$${randomProperty.pricePerNight}` : `Price not set`;
    meta.textContent = `${price}/night`;
    insideBox.appendChild(meta);

    container.appendChild(insideBox);
}
