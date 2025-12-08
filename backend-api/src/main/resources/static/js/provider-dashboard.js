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

    // Save the button div before clearing
    const buttonDiv = container.querySelector('div[style*="text-align: center"]');
    
    // Clear existing content except comments
    container.innerHTML = '';

    // Create "Your Listings" heading
    const gridTitle = document.createElement('h3');
    gridTitle.style.cssText = 'margin:0 0 20px 0; color:#0b1220; font-size:1.5rem;';
    gridTitle.textContent = 'Your Listings';
    container.appendChild(gridTitle);

    // Create property cards grid
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:20px; margin-bottom:20px;';

    properties.forEach(property => {
        const card = document.createElement('div');
        card.style.cssText = `
            border:2px solid ${property.isActive ? '#28a745' : '#6c757d'};
            padding:20px;
            border-radius:12px;
            background:white;
            box-shadow:0 2px 8px rgba(0,0,0,0.1);
            transition:transform 0.2s, box-shadow 0.2s;
            cursor:pointer;
        `;
        card.onmouseover = () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
        };
        card.onmouseout = () => {
            card.style.transform = '';
            card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        };
        card.onclick = () => window.location.href = `provider-listings.html`;

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
                <h4 style="margin:0; color:#0b1220; font-size:1.2rem;">${property.title || 'Untitled'}</h4>
                <span style="padding:4px 10px; border-radius:12px; font-size:0.8rem; font-weight:600; background:${property.isActive ? '#d4edda' : '#f8d7da'}; color:${property.isActive ? '#155724' : '#721c24'};">
                    ${property.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div style="color:#6b7280; font-size:0.9rem; margin-bottom:8px;">📍 ${property.location || 'No location'}</div>
            <div style="font-size:1.3rem; font-weight:700; color:#28a745; margin-bottom:10px;">$${property.pricePerNight || 0}/night</div>
            <div style="color:#374151; font-size:0.85rem;">👥 Up to ${property.maxGuests || 'N/A'} guests</div>
        `;

        grid.appendChild(card);
    });

    container.appendChild(grid);
    
    // Re-add the button if it existed
    if (buttonDiv) {
        container.appendChild(buttonDiv);
    }
}
