// Provider Listings Management - View, edit, and delete property listings
// Supports multiple images per property with carousel navigation

window.propertyImages = {}; // Store images for each property globally

//The main event listener to load when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {

    // Logout button functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace('provider-signin.html');
        });
    }

    //checks if a provider is logged in
    const providerId = localStorage.getItem('providerId');
    
    // Redirect to login if not authenticated
    if (!providerId) {
        window.location.href = 'provider-signin.html';
        return;
    }
    
    setupCreateForm();
    loadProperties();
});

//the main function to load properties
async function loadProperties() {
    try {

        const providerId = localStorage.getItem('providerId');
        if (!providerId) {
            console.error('No providerId found in localStorage');
            return;
        }
        const res = await fetch(`/api/properties/provider/${providerId}`);
        const properties = await res.json();
        renderProperties(properties);
    } catch (err) {
        console.error('Load error:', err);
    }
}

//the main function to render properties
function renderProperties(properties) {
    const container = document.querySelector('.listing-card');
    if (!container) return;
    
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    if (!properties.length) {
        const noPropsMsg = document.createElement('p');
        noPropsMsg.style.cssText = 'padding:20px; color:#666;';
        noPropsMsg.textContent = 'No properties found.';
        container.appendChild(noPropsMsg);
        return;
    }
    

    //the function to render each property card
    properties.forEach(prop => {
        // Parse images from JSON or single image string
        let images = [];
        if (prop.images) {
            try {
                if (prop.images.startsWith('[')) {
                    images = JSON.parse(prop.images);
                } else if (prop.images.startsWith('data:') || prop.images.startsWith('http')) {
                    images = [prop.images];
                }
            } catch (e) {
                console.error('Image parse error:', e);
            }
        }
        
        window.propertyImages[prop.id] = { images, index: 0 };
        
        const card = document.createElement('div');
        card.className = 'property-card';
        
        // Image container or no-image placeholder
        if (images.length > 0) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'property-card-image-container';
            
            const img = document.createElement('img');
            img.id = `img-${prop.id}`;
            img.className = 'property-card-image';
            
            const leftBtn = document.createElement('button');
            leftBtn.className = 'property-card-carousel-btn left';
            leftBtn.textContent = '❮';
            leftBtn.onclick = () => window.changeImg(prop.id, -1);
            
            const rightBtn = document.createElement('button');
            rightBtn.className = 'property-card-carousel-btn right';
            rightBtn.textContent = '❯';
            rightBtn.onclick = () => window.changeImg(prop.id, 1);
            
            const counter = document.createElement('div');
            counter.id = `counter-${prop.id}`;
            counter.className = 'property-card-counter';
            counter.textContent = `1 / ${images.length}`;
            
            imageContainer.appendChild(img);
            imageContainer.appendChild(leftBtn);
            imageContainer.appendChild(rightBtn);
            imageContainer.appendChild(counter);
            card.appendChild(imageContainer);
        } else {
            const noImage = document.createElement('div');
            noImage.className = 'property-card-no-image';
            noImage.textContent = 'No images';
            card.appendChild(noImage);
        }
        
        
        const header = document.createElement('div');
        header.className = 'property-card-header';
        
        const headerLeft = document.createElement('div');
        headerLeft.style.flex = '1';
        
        const title = document.createElement('h3');
        title.className = 'property-card-title';
        title.textContent = prop.title || 'Untitled';
        
        const locationDiv = document.createElement('div');
        locationDiv.className = 'property-card-location';
        const locationSpan = document.createElement('span');
        locationSpan.textContent = `📍 ${prop.location || 'No location'}`;
        locationDiv.appendChild(locationSpan);
        
        headerLeft.appendChild(title);
        headerLeft.appendChild(locationDiv);
        
        const priceDiv = document.createElement('div');
        priceDiv.className = 'property-card-price';

        const priceAmount = document.createElement('div');
        priceAmount.className = 'property-card-price-amount';
        priceAmount.textContent = `$${prop.pricePerNight || 0}`;

        const priceLabel = document.createElement('div');
        priceLabel.className = 'property-card-price-label';
        priceLabel.textContent = 'per night';
        priceDiv.appendChild(priceAmount);
        priceDiv.appendChild(priceLabel);
        
        header.appendChild(headerLeft);
        header.appendChild(priceDiv);
        card.appendChild(header);
        
        // Stats section for properties
        const stats = document.createElement('div');
        stats.className = 'property-card-stats';
        
        const guestsStat = document.createElement('div');
        guestsStat.className = 'property-card-stat';

        const guestsLabel = document.createElement('div');
        guestsLabel.className = 'property-card-stat-label';
        guestsLabel.textContent = 'Max Guests';

        const guestsValue = document.createElement('div');
        guestsValue.className = 'property-card-stat-value';
        guestsValue.textContent = `👥 ${prop.maxGuests || 'N/A'}`;
        guestsStat.appendChild(guestsLabel);
        guestsStat.appendChild(guestsValue);
        
        const statusStat = document.createElement('div');
        statusStat.className = 'property-card-stat';

        const statusLabel = document.createElement('div');
        statusLabel.className = 'property-card-stat-label';
        statusLabel.textContent = 'Status';

        const statusValue = document.createElement('div');
        statusValue.className = 'property-card-stat-value';
        statusValue.textContent = prop.isActive ? '✅ Active' : '❌ Inactive';
        statusStat.appendChild(statusLabel);
        statusStat.appendChild(statusValue);
        
        stats.appendChild(guestsStat);
        stats.appendChild(statusStat);
        card.appendChild(stats);
        
        // Amenities section
        const amenities = document.createElement('div');
        amenities.className = 'property-card-amenities';

        const amenitiesLabel = document.createElement('div');
        amenitiesLabel.className = 'property-card-amenities-label';
        amenitiesLabel.textContent = 'Amenities';

        const amenitiesValue = document.createElement('div');
        amenitiesValue.className = 'property-card-amenities-value';
        amenitiesValue.textContent = `🎯 ${prop.amenities || 'None listed'}`;
        amenities.appendChild(amenitiesLabel);
        amenities.appendChild(amenitiesValue);
        card.appendChild(amenities);
        
        // Description
        const description = document.createElement('div');
        description.className = 'property-card-description';
        description.textContent = prop.description || 'No description provided.';
        card.appendChild(description);
        
        // Actions
        const actions = document.createElement('div');
        actions.className = 'property-card-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'property-card-btn-edit';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => window.editProp(prop.id);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'property-card-btn-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => window.deleteProp(prop.id);
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        card.appendChild(actions);
        
        container.appendChild(card);
        
        //this loads the images.
        if (images.length > 0) {
            setTimeout(() => {
                const img = document.getElementById(`img-${prop.id}`);
                if (img) {
                    const imageData = images[0];
                    
                    // For base64 images, convert to blob to avoid URL length issues
                    if (imageData.startsWith('data:image')) {
                        try {
                            // Extract the base64 part and mime type
                            const parts = imageData.split(',');
                            const mimeType = parts[0].match(/:(.*?);/)[1];
                            const base64 = parts[1];
                            
                            // Convert base64 to blob
                            const byteChars = atob(base64);
                            const byteArray = new Uint8Array(byteChars.length);
                            for (let i = 0; i < byteChars.length; i++) {
                                byteArray[i] = byteChars.charCodeAt(i);
                            }
                            const blob = new Blob([byteArray], { type: mimeType });
                            const blobUrl = URL.createObjectURL(blob);
                            
                            img.src = blobUrl;
                            img.onerror = () => console.error(`Failed to load image for property ${prop.id}`);
                        } catch (err) {
                            console.error(`Error converting image for property ${prop.id}:`, err);
                        }
                    } else {
                        // For regular URLs, set directly
                        img.src = imageData;
                    }
                }
            }, 10);
        }
    });
}

// Navigate through property images (carousel functionality)
window.changeImg = function(propId, dir) {
    const data = window.propertyImages[propId];
    if (!data || !data.images.length) return;
    
    data.index = (data.index + dir + data.images.length) % data.images.length;
    
    const img = document.getElementById(`img-${propId}`);
    const counter = document.getElementById(`counter-${propId}`);
    const imageData = data.images[data.index];
    
    if (img) {
        // For base64 images, convert to blob
        if (imageData.startsWith('data:image')) {
            try {
                const parts = imageData.split(',');
                const mimeType = parts[0].match(/:(.*?);/)[1];
                const base64 = parts[1];
                
                const byteChars = atob(base64);
                const byteArray = new Uint8Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) {
                    byteArray[i] = byteChars.charCodeAt(i);
                }
                const blob = new Blob([byteArray], { type: mimeType });
                const blobUrl = URL.createObjectURL(blob);
                
                // Clean up old blob URL
                if (img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
                
                img.src = blobUrl;
            } catch (err) {
                console.error('Error in carousel:', err);
            }
        } else {
            img.src = imageData;
        }
    }
    
    if (counter) counter.textContent = `${data.index + 1} / ${data.images.length}`;
}

// Global array to store images for create form
let createFormImages = [];

// Toggle between file upload and URL input mode
window.toggleImageMode = function(mode) {
    const fileSection = document.getElementById('fileUploadSection');
    const urlSection = document.getElementById('urlInputSection');
    const fileBtn = document.getElementById('modeFileBtn');
    const urlBtn = document.getElementById('modeUrlBtn');
    
    if (mode === 'file') {
        fileSection.style.display = 'block';
        urlSection.style.display = 'none';
        fileBtn.style.background = '#007bff';
        fileBtn.style.color = 'white';
        urlBtn.style.background = '#e5e7eb';
        urlBtn.style.color = '#374151';
    } else {
        fileSection.style.display = 'none';
        urlSection.style.display = 'block';
        fileBtn.style.background = '#e5e7eb';
        fileBtn.style.color = '#374151';
        urlBtn.style.background = '#007bff';
        urlBtn.style.color = 'white';
    }
};

// this function adds image URLs to create form
window.addImageUrl = function() {
    const urlInput = document.getElementById('imageUrlInput');
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('Please enter a valid URL');
        return;
    }
    
    createFormImages.push(url);
    urlInput.value = '';
    updateCreateImagePreview();
};

// this function removes images from create form
window.removeCreateImage = function(index) {
    createFormImages.splice(index, 1);
    updateCreateImagePreview();
};

// this function updates image preview for create form
function updateCreateImagePreview() {
    const previewArea = document.getElementById('imagePreviewArea');
    if (!previewArea) return;
    
    while (previewArea.firstChild) {
        previewArea.removeChild(previewArea.firstChild);
    }
    
    createFormImages.forEach((img, index) => {
        const container = document.createElement('div');
        container.style.cssText = 'position:relative; aspect-ratio:1; border-radius:8px; overflow:hidden; border:2px solid #e5e7eb;';
        
        const imgEl = document.createElement('img');
        imgEl.src = img;
        imgEl.style.cssText = 'width:100%; height:100%; object-fit:cover;';
        
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.type = 'button';
        removeBtn.onclick = () => removeCreateImage(index);
        removeBtn.style.cssText = 'position:absolute; top:4px; right:4px; width:24px; height:24px; background:rgba(220,38,38,0.9); color:white; border:none; border-radius:50%; cursor:pointer; font-size:18px; line-height:1; padding:0; display:flex; align-items:center; justify-content:center;';
        
        container.appendChild(imgEl);
        container.appendChild(removeBtn);
        previewArea.appendChild(container);
    });
}


//this function sets up the create form
function setupCreateForm() {
    const form = document.getElementById('create-form');
    if (!form) return;
    
    // Setup file input handler
    const fileInput = document.getElementById('imageFiles');
    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            
            for (const file of files) {
                const reader = new FileReader();
                const base64 = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
                createFormImages.push(base64);
            }
            
            updateCreateImagePreview();
            fileInput.value = ''; // Reset input so same file can be added again
        });
    }
    

    //this event listener handles form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        const property = {
            title: formData.get('title'),
            description: formData.get('description'),
            location: formData.get('location'),
            pricePerNight: parseFloat(formData.get('pricePerNight')),
            maxGuests: parseInt(formData.get('maxGuests')),
            amenities: formData.get('amenities'),
            isActive: true,
            images: JSON.stringify(createFormImages),
            providerId: parseInt(localStorage.getItem('providerId'))
        };
        
        try {
            const res = await fetch('/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(property)
            });
            
            if (res.ok) {
                form.reset();
                createFormImages = []; // Clear images array
                updateCreateImagePreview(); // Clear preview
                // Redirect to My Cribs page
                window.location.href = 'provider-listings.html';
            } else {
                alert('Failed to create property');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
}

// Open modal to edit property details
window.editProp = async function(id) {
    const property = await fetch(`/api/properties/${id}`).then(r => r.json());
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'edit-modal-content';
    
    // Image mode toggle
    let currentMode = 'file';
    let selectedImages = [];
    let existingImages = [];
    
    // Parse existing images
    try {
        if (property.images) {
            if (property.images.startsWith('[')) {
                existingImages = JSON.parse(property.images);
            } else if (property.images.startsWith('data:') || property.images.startsWith('http')) {
                existingImages = [property.images];
            }
        }
    } catch (e) {
        console.error('Error parsing existing images:', e);
    }
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.style.cssText = 'text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:2px solid #e9ecef;';

    const modalTitle = document.createElement('h2');
    modalTitle.style.cssText = 'margin:0 0 8px 0; color:#0b1220; font-size:1.75rem; font-weight:700;';
    modalTitle.textContent = 'Edit Property';
    
    const modalSubtitle = document.createElement('p');
    modalSubtitle.style.cssText = 'margin:0; color:#6b7280; font-size:0.95rem;';
    modalSubtitle.textContent = 'Update your listing information';
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(modalSubtitle);
    modalContent.appendChild(modalHeader);
    
    // Create form
    const form = document.createElement('form');
    form.id = 'edit-form';
    
    // Basic Information Section
    const basicSection = document.createElement('div');
    basicSection.style.marginBottom = '28px';

    const basicTitle = document.createElement('h3');
    basicTitle.style.cssText = 'margin:0 0 16px 0; color:#0b1220; font-size:1.1rem; font-weight:600; padding-bottom:8px; border-bottom:2px solid #e9ecef;';
    basicTitle.textContent = '📝 Basic Information';
    basicSection.appendChild(basicTitle);
    
    const titleGroup = document.createElement('div');
    titleGroup.style.marginBottom = '18px';

    const titleLabel = document.createElement('label');
    titleLabel.style.cssText = 'display:block; margin-bottom:8px; font-weight:600; color:#374151; font-size:0.95rem;';
    titleLabel.textContent = 'Property Title *';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.name = 'title';
    titleInput.required = true;
    titleInput.style.cssText = 'width:100%; padding:12px 14px; border:2px solid #e5e7eb; border-radius:8px; color:#000; background:#fff; font-size:1rem; box-sizing:border-box; transition:border-color 0.2s;';
    titleInput.onfocus = () => titleInput.style.borderColor = '#007bff';
    titleInput.onblur = () => titleInput.style.borderColor = '#e5e7eb';
    titleGroup.appendChild(titleLabel);
    titleGroup.appendChild(titleInput);
    basicSection.appendChild(titleGroup);
    
    const locationGroup = document.createElement('div');
    locationGroup.style.marginBottom = '18px';

    const locationLabel = document.createElement('label');
    locationLabel.style.cssText = 'display:block; margin-bottom:8px; font-weight:600; color:#374151; font-size:0.95rem;';
    locationLabel.textContent = 'Location *';

    const locationInput = document.createElement('input');
    locationInput.type = 'text';
    locationInput.name = 'location';
    locationInput.required = true;
    locationInput.placeholder = 'e.g., Miami Beach, FL';
    locationInput.style.cssText = 'width:100%; padding:12px 14px; border:2px solid #e5e7eb; border-radius:8px; color:#000; background:#fff; font-size:1rem; box-sizing:border-box; transition:border-color 0.2s;';
    locationInput.onfocus = () => locationInput.style.borderColor = '#007bff';
    locationInput.onblur = () => locationInput.style.borderColor = '#e5e7eb';
    locationGroup.appendChild(locationLabel);
    locationGroup.appendChild(locationInput);
    basicSection.appendChild(locationGroup);
    
    const descGroup = document.createElement('div');
    descGroup.style.marginBottom = '18px';

    const descLabel = document.createElement('label');
    descLabel.style.cssText = 'display:block; margin-bottom:8px; font-weight:600; color:#374151; font-size:0.95rem;';
    descLabel.textContent = 'Description';

    const descTextarea = document.createElement('textarea');
    descTextarea.name = 'description';
    descTextarea.rows = 4;
    descTextarea.placeholder = 'Describe your property...';
    descTextarea.style.cssText = 'width:100%; padding:12px 14px; border:2px solid #e5e7eb; border-radius:8px; color:#000; background:#fff; font-size:1rem; box-sizing:border-box; resize:vertical; transition:border-color 0.2s;';
    descTextarea.onfocus = () => descTextarea.style.borderColor = '#007bff';
    descTextarea.onblur = () => descTextarea.style.borderColor = '#e5e7eb';
    descGroup.appendChild(descLabel);
    descGroup.appendChild(descTextarea);
    basicSection.appendChild(descGroup);
    
    form.appendChild(basicSection);
    
    // Pricing & Capacity Section
    const pricingSection = document.createElement('div');
    pricingSection.style.marginBottom = '28px';

    const pricingTitle = document.createElement('h3');
    pricingTitle.style.cssText = 'margin:0 0 16px 0; color:#0b1220; font-size:1.1rem; font-weight:600; padding-bottom:8px; border-bottom:2px solid #e9ecef;';
    pricingTitle.textContent = '💰 Pricing & Capacity';
    pricingSection.appendChild(pricingTitle);
    
    const pricingGrid = document.createElement('div');
    pricingGrid.style.cssText = 'display:grid; grid-template-columns:1fr 1fr; gap:18px;';
    
    const priceGroup = document.createElement('div');

    const priceLabel = document.createElement('label');
    // Label for price per night input
    priceLabel.style.cssText = 'display:block; margin-bottom:8px; font-weight:600; color:#374151; font-size:0.95rem;';
    priceLabel.textContent = 'Price per Night *';

    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.name = 'pricePerNight';
    priceInput.required = true;
    priceInput.min = '0';
    priceInput.step = '0.01';
    priceInput.placeholder = '0.00';
    priceInput.style.cssText = 'width:100%; padding:12px 14px; border:2px solid #e5e7eb; border-radius:8px; color:#000; background:#fff; font-size:1rem; box-sizing:border-box; transition:border-color 0.2s;';
    priceInput.onfocus = () => priceInput.style.borderColor = '#007bff';
    priceInput.onblur = () => priceInput.style.borderColor = '#e5e7eb';
    priceGroup.appendChild(priceLabel);
    priceGroup.appendChild(priceInput);
    
    const guestsGroup = document.createElement('div');

    const guestsLabel = document.createElement('label');

    guestsLabel.style.cssText = 'display:block; margin-bottom:8px; font-weight:600; color:#374151; font-size:0.95rem;';
    guestsLabel.textContent = 'Max Guests *';
    const guestsInput = document.createElement('input');
    guestsInput.type = 'number';
    guestsInput.name = 'maxGuests';
    guestsInput.required = true;
    guestsInput.min = '1';
    guestsInput.placeholder = '1';
    guestsInput.style.cssText = 'width:100%; padding:12px 14px; border:2px solid #e5e7eb; border-radius:8px; color:#000; background:#fff; font-size:1rem; box-sizing:border-box; transition:border-color 0.2s;';
    guestsInput.onfocus = () => guestsInput.style.borderColor = '#007bff';
    guestsInput.onblur = () => guestsInput.style.borderColor = '#e5e7eb';
    guestsGroup.appendChild(guestsLabel);
    guestsGroup.appendChild(guestsInput);
    
    pricingGrid.appendChild(priceGroup);
    pricingGrid.appendChild(guestsGroup);
    pricingSection.appendChild(pricingGrid);
    form.appendChild(pricingSection);
    
    // Amenities & Status Section
    const amenitiesSection = document.createElement('div');
    amenitiesSection.style.marginBottom = '28px';

    const amenitiesTitle = document.createElement('h3');
    amenitiesTitle.style.cssText = 'margin:0 0 16px 0; color:#0b1220; font-size:1.1rem; font-weight:600; padding-bottom:8px; border-bottom:2px solid #e9ecef;';
    amenitiesTitle.textContent = '✨ Amenities & Status';
    amenitiesSection.appendChild(amenitiesTitle);
    
    const amenitiesGroup = document.createElement('div');
    amenitiesGroup.style.marginBottom = '18px';

    const amenitiesLabel = document.createElement('label');
    amenitiesLabel.style.cssText = 'display:block; margin-bottom:8px; font-weight:600; color:#374151; font-size:0.95rem;';
    amenitiesLabel.textContent = 'Amenities';

    const amenitiesInput = document.createElement('input');
    amenitiesInput.type = 'text';
    amenitiesInput.name = 'amenities';
    amenitiesInput.placeholder = 'WiFi, Pool, Parking, Kitchen...';
    amenitiesInput.style.cssText = 'width:100%; padding:12px 14px; border:2px solid #e5e7eb; border-radius:8px; color:#000; background:#fff; font-size:1rem; box-sizing:border-box; transition:border-color 0.2s;';
    amenitiesInput.onfocus = () => amenitiesInput.style.borderColor = '#007bff';
    amenitiesInput.onblur = () => amenitiesInput.style.borderColor = '#e5e7eb';
    amenitiesGroup.appendChild(amenitiesLabel);
    amenitiesGroup.appendChild(amenitiesInput);
    amenitiesSection.appendChild(amenitiesGroup);
    
    const activeLabel = document.createElement('label');
    activeLabel.style.cssText = 'display:flex; align-items:center; gap:10px; padding:12px; background:#f9fafb; border-radius:8px; cursor:pointer; transition:background 0.2s;';
    activeLabel.onmouseover = () => activeLabel.style.background = '#f3f4f6';
    activeLabel.onmouseout = () => activeLabel.style.background = '#f9fafb';

    const activeCheckbox = document.createElement('input');
    activeCheckbox.type = 'checkbox';
    activeCheckbox.name = 'isActive';
    activeCheckbox.style.cssText = 'width:20px; height:20px; cursor:pointer;';

    const activeSpan = document.createElement('span');
    activeSpan.style.cssText = 'font-weight:600; color:#374151; font-size:0.95rem;';
    activeSpan.textContent = 'Active Listing (Visible to customers)';
    activeLabel.appendChild(activeCheckbox);
    activeLabel.appendChild(activeSpan);
    amenitiesSection.appendChild(activeLabel);
    form.appendChild(amenitiesSection);
    
    // Images Section
    const imagesSection = document.createElement('div');
    imagesSection.style.marginBottom = '28px';

    const imagesTitle = document.createElement('h3');
    imagesTitle.style.cssText = 'margin:0 0 16px 0; color:#0b1220; font-size:1.1rem; font-weight:600; padding-bottom:8px; border-bottom:2px solid #e9ecef;';
    imagesTitle.textContent = '📷 Images';
    imagesSection.appendChild(imagesTitle);
    
    const btnContainer = document.createElement('div');

    btnContainer.style.cssText = 'display:flex; gap:12px; margin-bottom:14px;';
    const btnFile = document.createElement('button');
    btnFile.type = 'button';
    btnFile.id = 'btn-file';
    btnFile.style.cssText = 'padding:10px 20px; background:#007bff; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:0.95rem; transition:background 0.2s;';
    btnFile.onmouseover = () => btnFile.style.background = '#0056b3';
    btnFile.onmouseout = () => btnFile.style.background = '#007bff';
    btnFile.textContent = '📁 Upload Files';

    const btnUrl = document.createElement('button');
    btnUrl.type = 'button';
    btnUrl.id = 'btn-url';
    btnUrl.style.cssText = 'padding:10px 20px; background:#6c757d; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:0.95rem; transition:background 0.2s;';
    btnUrl.onmouseover = () => btnUrl.style.background = '#5a6268';
    btnUrl.onmouseout = () => btnUrl.style.background = '#6c757d';
    btnUrl.textContent = '🔗 Paste URLs';
    btnContainer.appendChild(btnFile);
    btnContainer.appendChild(btnUrl);
    imagesSection.appendChild(btnContainer);
    
    const fileContainer = document.createElement('div');
    fileContainer.id = 'file-input-container';
    fileContainer.style.display = 'block';

    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.id = 'image-input';
    imageInput.accept = 'image/*';
    imageInput.multiple = true;
    imageInput.style.cssText = 'padding:10px; border:2px dashed #d1d5db; border-radius:8px; width:100%; box-sizing:border-box; background:#fafafa; cursor:pointer; font-size:0.9rem;';

    const imagePreview = document.createElement('div');
    imagePreview.id = 'image-preview';
    imagePreview.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fill, minmax(120px, 1fr)); gap:12px; margin-top:12px;';
    fileContainer.appendChild(imageInput);
    fileContainer.appendChild(imagePreview);
    imagesSection.appendChild(fileContainer);
    
    const urlContainer = document.createElement('div');
    urlContainer.id = 'url-input-container';
    urlContainer.style.display = 'none';
    const urlInput = document.createElement('textarea');
    urlInput.id = 'url-input';
    urlInput.placeholder = 'Paste image URLs (one per line)';
    urlInput.rows = 4;
    urlInput.style.cssText = 'width:100%; padding:12px 14px; border:2px solid #e5e7eb; border-radius:8px; color:#000; background:#fff; font-size:1rem; box-sizing:border-box; resize:vertical;';
    urlContainer.appendChild(urlInput);
    imagesSection.appendChild(urlContainer);
    form.appendChild(imagesSection);
    
    // Error div
    const errorDiv = document.createElement('div');
    errorDiv.id = 'edit-error';
    errorDiv.style.cssText = 'color:#dc3545; margin-bottom:15px; padding:12px; background:#ffe6e6; border-radius:8px; display:none; font-weight:500;';
    form.appendChild(errorDiv);
    
    // Actions
    const actionsDiv = document.createElement('div');
    
    actionsDiv.style.cssText = 'display:flex; gap:12px; justify-content:flex-end; margin-top:30px; padding-top:24px; border-top:2px solid #e9ecef;';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.id = 'edit-cancel';
    cancelBtn.style.cssText = 'padding:13px 32px; background:#6c757d; color:white; border:none; border-radius:8px; cursor:pointer; font-size:1rem; font-weight:600; transition:background 0.2s;';
    cancelBtn.onmouseover = () => cancelBtn.style.background = '#5a6268';
    cancelBtn.onmouseout = () => cancelBtn.style.background = '#6c757d';
    cancelBtn.textContent = 'Cancel';
    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.style.cssText = 'padding:13px 32px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-size:1rem; font-weight:600; transition:background 0.2s; box-shadow:0 2px 4px rgba(40,167,69,0.2);';
    saveBtn.onmouseover = () => saveBtn.style.background = '#218838';
    saveBtn.onmouseout = () => saveBtn.style.background = '#28a745';
    saveBtn.textContent = '💾 Save Changes';
    actionsDiv.appendChild(cancelBtn);
    actionsDiv.appendChild(saveBtn);
    form.appendChild(actionsDiv);
    
    modalContent.appendChild(form);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Get elements and set values
    form.querySelector('[name="title"]').value = property.title || '';
    form.querySelector('[name="description"]').value = property.description || '';
    form.querySelector('[name="location"]').value = property.location || '';
    form.querySelector('[name="pricePerNight"]').value = property.pricePerNight || '';
    form.querySelector('[name="maxGuests"]').value = property.maxGuests || '';
    form.querySelector('[name="amenities"]').value = property.amenities || '';
    form.querySelector('[name="isActive"]').checked = property.isActive || false;
    
    // Toggle mode (btnFile, btnUrl, fileContainer, urlContainer already declared above)
    btnFile.addEventListener('click', () => {
        currentMode = 'file';
        btnFile.style.background = '#007bff';
        btnUrl.style.background = '#6c757d';
        fileContainer.style.display = 'block';
        urlContainer.style.display = 'none';
    });
    
    btnUrl.addEventListener('click', () => {
        currentMode = 'url';
        btnFile.style.background = '#6c757d';
        btnUrl.style.background = '#007bff';
        fileContainer.style.display = 'none';
        urlContainer.style.display = 'block';
    });
    
    // Display existing images first
    existingImages.forEach((imgSrc, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'position:relative;';
        div.dataset.existingIndex = index;
        
        // For base64 images, create a thumbnail
        const imgElement = document.createElement('img');
        imgElement.style.cssText = 'width:100%; height:100px; object-fit:cover; border-radius:5px;';
        
        if (imgSrc.startsWith('data:image')) {
            try {
                const parts = imgSrc.split(',');
                const mimeType = parts[0].match(/:(.*?);/)[1];
                const base64 = parts[1];
                const byteChars = atob(base64);
                const byteArray = new Uint8Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) {
                    byteArray[i] = byteChars.charCodeAt(i);
                }
                const blob = new Blob([byteArray], { type: mimeType });
                imgElement.src = URL.createObjectURL(blob);
            } catch (err) {
                imgElement.src = imgSrc;
            }
        } else {
            imgElement.src = imgSrc;
        }
        
        div.appendChild(imgElement);
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '×';
        removeBtn.style.cssText = 'position:absolute; top:5px; right:5px; background:#dc3545; color:white; border:none; border-radius:50%; width:25px; height:25px; cursor:pointer;';
        removeBtn.onclick = () => {
            existingImages.splice(index, 1);
            div.remove();
        };
        div.appendChild(removeBtn);
        
        imagePreview.appendChild(div);
    });
    
    // Handle file selection - add new images
    imageInput.addEventListener('change', (e) => {
        const newFiles = Array.from(e.target.files);
        selectedImages = [...selectedImages, ...newFiles];
        
        newFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.style.cssText = 'position:relative;';
                div.dataset.newImage = 'true';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.cssText = 'width:100%; height:100px; object-fit:cover; border-radius:5px;';
                div.appendChild(img);
                
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.textContent = '×';
                removeBtn.style.cssText = 'position:absolute; top:5px; right:5px; background:#dc3545; color:white; border:none; border-radius:50%; width:25px; height:25px; cursor:pointer;';
                removeBtn.onclick = () => {
                    const fileIndex = selectedImages.indexOf(file);
                    if (fileIndex > -1) selectedImages.splice(fileIndex, 1);
                    div.remove();
                };
                div.appendChild(removeBtn);
                
                imagePreview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
        
        // Clear the file input so the same file can be selected again
        imageInput.value = '';
    });
    
    // Handle form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        // Build updated property
        const updatedProp = {
            ...property,
            title: formData.get('title'),
            description: formData.get('description'),
            location: formData.get('location'),
            pricePerNight: parseFloat(formData.get('pricePerNight')),
            maxGuests: parseInt(formData.get('maxGuests')),
            amenities: formData.get('amenities'),
            isActive: formData.get('isActive') === 'on'
        };
        
        // Handle images - combine existing and new
        let allImages = [...existingImages];
        
        if (currentMode === 'file' && selectedImages.length > 0) {
            // Add new uploaded images
            for (const file of selectedImages) {
                const reader = new FileReader();
                const base64 = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
                allImages.push(base64);
            }
        } else if (currentMode === 'url' && urlInput.value.trim()) {
            // Add new URL images
            const newUrls = urlInput.value.split('\n').map(url => url.trim()).filter(url => url);
            allImages = [...allImages, ...newUrls];
        }
        
        // Update images only if there are changes
        if (allImages.length > 0) {
            updatedProp.images = JSON.stringify(allImages);
        }
        
        try {
            const res = await fetch(`/api/properties/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProp)
            });
            
            if (res.ok) {
                document.body.removeChild(modal);
                loadProperties();
            } else {
                form.querySelector('#edit-error').style.display = 'block';
                form.querySelector('#edit-error').textContent = 'Failed to update property';
            }
        } catch (err) {
            form.querySelector('#edit-error').style.display = 'block';
            form.querySelector('#edit-error').textContent = 'Error: ' + err.message;
        }
    });
    
    // Close modal
    form.querySelector('#edit-cancel').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) document.body.removeChild(modal);
    });
}

window.deleteProp = async function(id) {
    try {
        await fetch(`/api/properties/${id}`, { method: 'DELETE' });
        loadProperties();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}
