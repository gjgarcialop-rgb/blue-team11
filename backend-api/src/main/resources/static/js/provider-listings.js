document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.clear();
  window.location.href = 'provider-signin.html';
});


document.addEventListener('DOMContentLoaded', async function() {
  const providerId = localStorage.getItem('providerId');
  if (!providerId) {
        window.location.href = 'provider-signin.html';
        return;
    } 

    console.log('logged in as provider with ID:', providerId);
  
    const propertyCard = document.querySelector('.listing-card');
   const createForm = document.querySelector('#create-form');


    if (createForm) setupForm(createForm);

    fetchAllProperties();
})

async function fetchAllProperties() {
    try {
        const response = await fetch('/api/properties');
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        const data = await response.json();
        renderPropertiesList(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error('Error fetching Properties:', err);
        renderPropertiesList([]);
    }

}







function renderPropertiesList(properties) {
    const propertyCard = document.querySelector('.listing-card');
    if (!propertyCard) return;

    while (propertyCard.firstChild) propertyCard.removeChild(propertyCard.firstChild);

    if (!properties || properties.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'No properties found.';
    propertyCard.appendChild(p);
    return;
  }

  properties.forEach(property => {
    const box = document.createElement('div');
    box.id = 'box';

    const title = document.createElement('h3');
    title.textContent = property.title || 'Untitled Property';
    box.appendChild(title);
    propertyCard.appendChild(box);
  })

    
}

function setupForm(form) {
  const titleEl = form.elements['title'];
  const locationEl = form.elements['location'];
  const descEl = form.elements['description'];
  const priceEl = form.elements['pricePerNight'];
  const amenitiesEl = form.elements['amenities'];
  const maxGuestsEl = form.elements['maxGuests'];
  

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const providerId = localStorage.getItem('providerId');
    if(!providerId) {
      alert('You must be signed in as a provider to add a property.');
      window.location.href = 'provider-signin.html';
      return;
    }


    const payload = {
  title: titleEl ? titleEl.value.trim() : '',
  location: locationEl ? locationEl.value.trim() : '',
  description: descEl ? descEl.value.trim() : '',
  pricePerNight: priceEl ? parseFloat(priceEl.value.trim()) : 0,
  amenities: amenitiesEl ? amenitiesEl.value.trim() : '',
  maxGuests: maxGuestsEl ? parseInt(maxGuestsEl.value.trim(), 10) : 1,
  providerId: parseInt(providerId, 10), // ← use localStorage providerId
  isActive: true
};

const res = await fetch('/api/properties', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

//     const payload = {
//       title: titleEl ? titleEl.value.trim() : '',
//       location: locationEl ? locationEl.value.trim() : '',
//       description: descEl ? descEl.value.trim() : '',
//       pricePerNight: priceEl ? parseFloat(priceEl.value.trim()) : 0,
//       amenities: amenitiesEl ? amenitiesEl.value.trim() : '',
//       maxGuests: maxGuestsEl ? parseInt(maxGuestsEl.value.trim(), 10) : 1,
//       provider: { id: parseInt(providerId, 10) },
//       isActive: true
//     };



//     try {
//       const res = await fetch('/api/properties', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });
//       if (!res.ok) {
//   const text = await res.text();
//   console.error('Backend error:', text);  // ← see what went wrong
//   throw new Error(`${res.status} ${text}`);
// }
      const created = await res.json().catch(() => null);
      form.reset();
      if (created && created.propertyId != null) {
        window.location.href = `details.html?id=${encodeURIComponent(created.propertyId)}`;
      } else {
        window.location.href = 'index.html';
      }
    // } catch (err) {
    //   console.error('Error adding property:', err);
    //   alert('Failed to add property. See console for details.');
    // }
  });
}



