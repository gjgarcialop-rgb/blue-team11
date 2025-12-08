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
        console.log('Fetching properties from /api/properties...');
        const response = await fetch('/api/properties');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        renderPropertiesList(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error('Error fetching Properties:', err);
        const propertyCard = document.querySelector('.listing-card');
        if (propertyCard) {
            propertyCard.innerHTML = `<p style="color:#dc3545; padding:20px;">Error loading properties: ${err.message}</p>`;
        }
    }
}







function renderPropertiesList(properties) {
    const propertyCard = document.querySelector('.listing-card');
    if (!propertyCard) return;

    while (propertyCard.firstChild) propertyCard.removeChild(propertyCard.firstChild);

    if (!properties || properties.length === 0) {
        const p = document.createElement('p');
        p.style.cssText = 'color:#6b7280; text-align:center; padding:30px;';
        p.textContent = 'No properties found.';
        propertyCard.appendChild(p);
        return;
    }

    const providerId = localStorage.getItem('providerId');
    console.log('Provider ID from localStorage:', providerId);
    console.log('Total properties received:', properties.length);
    
    // FOR NOW: Show ALL properties to debug, then we'll filter
    const myProperties = properties; // Temporarily show all
    
    // This is the filtering code we'll use once we verify properties exist:
    // const myProperties = properties.filter(p => {
    //     return p.provider && p.provider.id == providerId;
    // });

    if (myProperties.length === 0) {
        const p = document.createElement('p');
        p.style.cssText = 'color:#6b7280; text-align:center; padding:30px;';
        p.textContent = `No properties found in the system. (Provider ID: ${providerId})`;
        propertyCard.appendChild(p);
        return;
    }

    myProperties.forEach(property => {
        const card = document.createElement('div');
        card.style.cssText = `
            border: 2px solid #007bff;
            padding: 24px;
            margin: 20px 0;
            border-radius: 12px;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:16px; border-bottom:2px solid #f3f4f6; padding-bottom:12px;">
                <div style="flex:1;">
                    <h3 style="margin:0 0 8px 0; color:#0b1220; font-size:1.4rem;">${property.title || 'Untitled'}</h3>
                    <div style="display:inline-block; background:#e3f2fd; padding:6px 12px; border-radius:6px; border:1px solid #90caf9;">
                        <span style="color:#1565c0; font-weight:600; font-size:0.95rem;">📍 ${property.location || 'No location'}</span>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.5rem; font-weight:700; color:#28a745;">$${property.pricePerNight || 0}</div>
                    <div style="font-size:0.85rem; color:#6b7280;">per night</div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:16px;">
                <div style="background:#f9fafb; padding:12px; border-radius:8px;">
                    <div style="color:#6b7280; font-size:0.85rem; margin-bottom:4px;">Max Guests</div>
                    <div style="color:#0b1220; font-weight:600; font-size:1rem;">👥 ${property.maxGuests || 'N/A'}</div>
                </div>
                <div style="background:#f9fafb; padding:12px; border-radius:8px;">
                    <div style="color:#6b7280; font-size:0.85rem; margin-bottom:4px;">Status</div>
                    <div style="color:#0b1220; font-weight:600; font-size:1rem;">${property.isActive ? '✅ Active' : '❌ Inactive'}</div>
                </div>
            </div>

            <div style="background:#f9fafb; padding:12px; border-radius:8px; margin-bottom:16px;">
                <div style="color:#6b7280; font-size:0.85rem; margin-bottom:6px;">Amenities</div>
                <div style="color:#0b1220; font-weight:500; font-size:0.95rem;">🎯 ${property.amenities || 'None listed'}</div>
            </div>

            <div style="color:#374151; line-height:1.6; margin-bottom:20px; font-size:0.95rem;">
                ${property.description || 'No description provided.'}
            </div>

            <div style="display:flex; gap:10px; justify-content:flex-end;">
                <button onclick="viewPropertyDetails(${property.id})" style="padding:10px 20px; background:#007bff; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">View Details</button>
                <button onclick="editProperty(${property.id})" style="padding:10px 20px; background:#ffc107; color:#000; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Edit</button>
                <button onclick="deleteProperty(${property.id})" style="padding:10px 20px; background:#dc3545; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Delete</button>
            </div>
        `;

        propertyCard.appendChild(card);
    });
}

function viewPropertyDetails(propertyId) {
    window.location.href = `provider-property-details.html?id=${propertyId}`;
}

async function editProperty(propertyId) {
    try {
        const response = await fetch(`/api/properties/${propertyId}`);
        if (!response.ok) {
            alert('Error loading property details');
            return;
        }
        
        const property = await response.json();
        
        // Create edit modal
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; overflow-y:auto; padding:20px;">
                <div style="background:white; padding:30px; border-radius:12px; max-width:600px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 4px 20px rgba(0,0,0,0.3);">
                    <h3 style="margin-top:0; color:#0b1220;">Edit Property</h3>
                    <form id="editPropertyForm" style="display:flex; flex-direction:column; gap:15px;">
                        <label style="display:flex; flex-direction:column; font-weight:600; color:#0b1220;">
                            Title
                            <input type="text" id="editTitle" value="${property.title || ''}" required style="padding:10px; border:1px solid #d1d5db; border-radius:8px; margin-top:5px;">
                        </label>
                        <label style="display:flex; flex-direction:column; font-weight:600; color:#0b1220;">
                            Location
                            <input type="text" id="editLocation" value="${property.location || ''}" required style="padding:10px; border:1px solid #d1d5db; border-radius:8px; margin-top:5px;">
                        </label>
                        <label style="display:flex; flex-direction:column; font-weight:600; color:#0b1220;">
                            Description
                            <textarea id="editDescription" required style="padding:10px; border:1px solid #d1d5db; border-radius:8px; margin-top:5px; min-height:100px;">${property.description || ''}</textarea>
                        </label>
                        <label style="display:flex; flex-direction:column; font-weight:600; color:#0b1220;">
                            Price per Night ($)
                            <input type="number" id="editPrice" value="${property.pricePerNight || 0}" min="0" step="0.01" required style="padding:10px; border:1px solid #d1d5db; border-radius:8px; margin-top:5px;">
                        </label>
                        <label style="display:flex; flex-direction:column; font-weight:600; color:#0b1220;">
                            Max Guests
                            <input type="number" id="editMaxGuests" value="${property.maxGuests || 1}" min="1" required style="padding:10px; border:1px solid #d1d5db; border-radius:8px; margin-top:5px;">
                        </label>
                        <label style="display:flex; flex-direction:column; font-weight:600; color:#0b1220;">
                            Amenities
                            <input type="text" id="editAmenities" value="${property.amenities || ''}" style="padding:10px; border:1px solid #d1d5db; border-radius:8px; margin-top:5px;">
                        </label>
                        <label style="display:flex; align-items:center; gap:10px; font-weight:600; color:#0b1220;">
                            <input type="checkbox" id="editIsActive" ${property.isActive ? 'checked' : ''} style="width:20px; height:20px;">
                            Active Listing
                        </label>
                        <div id="editError" style="color:#b91c1c; font-weight:600;"></div>
                        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:10px;">
                            <button type="button" id="editCancel" style="padding:10px 20px; border:1px solid #d1d5db; background:white; border-radius:6px; cursor:pointer;">Cancel</button>
                            <button type="submit" style="padding:10px 20px; background:#ffc107; color:#000; border:none; border-radius:6px; cursor:pointer; font-weight:600;">Update Property</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const form = modal.querySelector('#editPropertyForm');
        const closeModal = () => document.body.removeChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal.firstElementChild) closeModal();
        });
        modal.querySelector('#editCancel').addEventListener('click', closeModal);
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorEl = modal.querySelector('#editError');
            errorEl.textContent = '';
            
            const updatedProperty = {
                ...property,
                title: modal.querySelector('#editTitle').value.trim(),
                location: modal.querySelector('#editLocation').value.trim(),
                description: modal.querySelector('#editDescription').value.trim(),
                pricePerNight: parseFloat(modal.querySelector('#editPrice').value),
                maxGuests: parseInt(modal.querySelector('#editMaxGuests').value),
                amenities: modal.querySelector('#editAmenities').value.trim(),
                isActive: modal.querySelector('#editIsActive').checked
            };
            
            try {
                const updateResponse = await fetch(`/api/properties/${propertyId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedProperty)
                });
                
                if (updateResponse.ok) {
                    closeModal();
                    fetchAllProperties(); // Reload the list
                } else {
                    const errorText = await updateResponse.text();
                    errorEl.textContent = 'Error: ' + errorText;
                }
            } catch (error) {
                console.error('Error updating property:', error);
                errorEl.textContent = 'Network error. Please try again.';
            }
        });
        
    } catch (error) {
        console.error('Error loading property:', error);
        alert('Error loading property details.');
    }
}

async function deleteProperty(propertyId) {
    if (!confirm('Are you sure you want to delete this property? This cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/properties/${propertyId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Property deleted successfully!');
            fetchAllProperties(); // Reload the list
        } else {
            alert('Error deleting property');
        }
    } catch (error) {
        console.error('Error deleting property:', error);
        alert('Network error. Please try again.');
    }
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



