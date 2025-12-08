// Simple provider listings with working image support

window.propertyImages = {}; // Store images for each property globally

document.addEventListener('DOMContentLoaded', () => {
    const providerId = localStorage.getItem('providerId');
    if (!providerId) {
        window.location.href = 'provider-signin.html';
        return;
    }
    
    setupCreateForm();
    loadProperties();
});

async function loadProperties() {
    try {
        const res = await fetch('/api/properties');
        const properties = await res.json();
        renderProperties(properties);
    } catch (err) {
        console.error('Load error:', err);
    }
}

function renderProperties(properties) {
    const container = document.querySelector('.listing-card');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!properties.length) {
        container.innerHTML = '<p style="padding:20px; color:#666;">No properties found.</p>';
        return;
    }
    
    properties.forEach(prop => {
        // Parse images
        let images = [];
        if (prop.images) {
            console.log(`Property ${prop.id} - Raw images length: ${prop.images.length} chars`);
            try {
                if (prop.images.startsWith('[')) {
                    images = JSON.parse(prop.images);
                    console.log(`✅ Parsed ${images.length} images from JSON array`);
                    if (images.length > 0) {
                        console.log(`   First image length: ${images[0].length} chars`);
                    }
                } else if (prop.images.startsWith('data:') || prop.images.startsWith('http')) {
                    images = [prop.images];
                    console.log(`Single image detected`);
                }
            } catch (e) {
                console.error('Image parse error:', e);
            }
        } else {
            console.log(`Property ${prop.id} has no images`);
        }
        
        window.propertyImages[prop.id] = { images, index: 0 };
        
        const card = document.createElement('div');
        card.style.cssText = 'border:2px solid #007bff; padding:24px; margin:20px 0; border-radius:12px; background:white;';
        
        card.innerHTML = `
            ${images.length > 0 ? `
                <div style="position:relative; margin-bottom:20px;">
                    <img id="img-${prop.id}" style="width:100%; height:300px; object-fit:cover; border-radius:8px; background:#f0f0f0;">
                    <button onclick="window.changeImg(${prop.id}, -1)" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.7); color:white; border:none; padding:10px 15px; border-radius:50%; cursor:pointer; font-size:20px;">❮</button>
                    <button onclick="window.changeImg(${prop.id}, 1)" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.7); color:white; border:none; padding:10px 15px; border-radius:50%; cursor:pointer; font-size:20px;">❯</button>
                    <div id="counter-${prop.id}" style="position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.7); color:white; padding:5px 10px; border-radius:5px;">1 / ${images.length}</div>
                </div>
            ` : '<div style="padding:40px; background:#f5f5f5; text-align:center; color:#999; margin-bottom:20px; border-radius:8px;">No images</div>'}
            
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:15px; border-bottom:2px solid #e9ecef; padding-bottom:12px;">
                <div style="flex:1;">
                    <h3 style="margin:0 0 8px 0; color:#0b1220; font-size:1.4rem;">${prop.title || 'Untitled'}</h3>
                    <div style="display:inline-block; background:#e3f2fd; padding:6px 12px; border-radius:6px; border:1px solid #90caf9;">
                        <span style="color:#1565c0; font-weight:600; font-size:0.95rem;">📍 ${prop.location || 'No location'}</span>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.6rem; font-weight:700; color:#28a745;">$${prop.pricePerNight || 0}</div>
                    <div style="font-size:0.85rem; color:#6b7280;">per night</div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:16px;">
                <div style="background:#f9fafb; padding:12px; border-radius:8px;">
                    <div style="color:#6b7280; font-size:0.85rem; margin-bottom:4px;">Max Guests</div>
                    <div style="color:#0b1220; font-weight:600; font-size:1rem;">👥 ${prop.maxGuests || 'N/A'}</div>
                </div>
                <div style="background:#f9fafb; padding:12px; border-radius:8px;">
                    <div style="color:#6b7280; font-size:0.85rem; margin-bottom:4px;">Status</div>
                    <div style="color:#0b1220; font-weight:600; font-size:1rem;">${prop.isActive ? '✅ Active' : '❌ Inactive'}</div>
                </div>
            </div>

            <div style="background:#f9fafb; padding:12px; border-radius:8px; margin-bottom:16px;">
                <div style="color:#6b7280; font-size:0.85rem; margin-bottom:6px;">Amenities</div>
                <div style="color:#0b1220; font-weight:500; font-size:0.95rem;">🎯 ${prop.amenities || 'None listed'}</div>
            </div>

            <div style="color:#374151; line-height:1.6; margin-bottom:20px; font-size:0.95rem;">
                ${prop.description || 'No description provided.'}
            </div>
            
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button onclick="window.editProp(${prop.id})" style="padding:10px 20px; background:#ffc107; border:none; border-radius:5px; cursor:pointer; font-weight:600;">Edit</button>
                <button onclick="window.deleteProp(${prop.id})" style="padding:10px 20px; background:#dc3545; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:600;">Delete</button>
            </div>
        `;
        
        container.appendChild(card);
        
        // Load first image
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
                            img.onload = () => console.log(`✅ Image loaded for property ${prop.id}`);
                            img.onerror = () => console.error(`❌ Failed to load image for property ${prop.id}`);
                        } catch (err) {
                            console.error(`Error converting image for property ${prop.id}:`, err);
                        }
                    } else {
                        // For regular URLs, set directly
                        img.src = imageData;
                        img.onload = () => console.log(`✅ Image loaded for property ${prop.id}`);
                    }
                }
            }, 10);
        }
    });
}

window.changeImg = function(propId, dir) {
    console.log('changeImg called:', propId, dir);
    const data = window.propertyImages[propId];
    console.log('Property data:', data);
    if (!data || !data.images.length) {
        console.error('No data or no images!');
        return;
    }
    
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

// Add image URL to create form
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

// Remove image from create form
window.removeCreateImage = function(index) {
    createFormImages.splice(index, 1);
    updateCreateImagePreview();
};

// Update image preview for create form
function updateCreateImagePreview() {
    const previewArea = document.getElementById('imagePreviewArea');
    if (!previewArea) return;
    
    previewArea.innerHTML = '';
    
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

window.editProp = async function(id) {
    const property = await fetch(`/api/properties/${id}`).then(r => r.json());
    console.log('Editing property:', property);
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;';
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background:white; padding:40px; border-radius:16px; width:90%; max-width:650px; max-height:90vh; overflow-y:auto; box-shadow:0 10px 40px rgba(0,0,0,0.3);';
    
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
    
    // Escape values for HTML
    const escapeHtml = (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    modalContent.innerHTML = `
        <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:2px solid #e9ecef;">
            <h2 style="margin:0 0 8px 0; color:#0b1220; font-size:1.75rem; font-weight:700;">Edit Property</h2>
            <p style="margin:0; color:#6b7280; font-size:0.95rem;">Update your listing information</p>
        </div>
        
        <form id="edit-form">
            <!-- Basic Information Section -->
            <div style="margin-bottom:28px;">
                <h3 style="margin:0 0 16px 0; color:#0b1220; font-size:1.1rem; font-weight:600; padding-bottom:8px; border-bottom:2px solid #e9ecef;">📝 Basic Information</h3>
                
                <div style="margin-bottom:18px;">
                    <label style="display:block; margin-bottom:8px; font-weight:600; color:#374151; font-size:0.95rem;">Property Title *</label>
                    <input type="text" name="title" required style="width:100%; padding:12px 14px; border:2px solid #e5e7eb; border-radius:8px; color:#000; background:#fff; font-size:1rem; box-sizing:border-box; transition:border-color 0.2s;" onfocus="this.style.borderColor='#007bff'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                
                <div style="margin-bottom:18px;">
                    <label style="display:block; margin-bottom:8px; font-weight:600; color:#374151; font-size:0.95rem;">Location *</label>
                    <input type="text" name="location" required placeholder="e.g., Miami Beach, FL" style="width:100%; padding:12px 14px; border:2px solid #e5e7eb; border-radius:8px; color:#000; background:#fff; font-size:1rem; box-sizing:border-box; transition:border-color 0.2s;" onfocus="this.style.borderColor='#007bff'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                
                <div style="margin-bottom:18px;">
                    <label style="display:block; margin-bottom:8px; font-weight:600; color:#374151; font-size:0.95rem;">Description</label>
                    <textarea name="description" rows="4" placeholder="Describe your property..." style="width:100%; padding:12px 14px; border:2px solid #e5e7eb; border-radius:8px; color:#000; background:#fff; font-size:1rem; box-sizing:border-box; resize:vertical; transition:border-color 0.2s;" onfocus="this.style.borderColor='#007bff'" onblur="this.style.borderColor='#e5e7eb'"></textarea>
                </div>
            </div>
            
            <!-- Pricing & Capacity Section -->
            <div style="margin-bottom:28px;">
                <h3 style="margin:0 0 16px 0; color:#0b1220; font-size:1.1rem; font-weight:600; padding-bottom:8px; border-bottom:2px solid #e9ecef;">💰 Pricing & Capacity</h3>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:18px;">
                    <div>
                        <label style="display:block; margin-bottom:8px; font-weight:600; color:#374151; font-size:0.95rem;">Price per Night *</label>
                        <input type="number" name="pricePerNight" required min="0" step="0.01" placeholder="0.00" style="width:100%; padding:12px 14px; border:2px solid #e5e7eb; border-radius:8px; color:#000; background:#fff; font-size:1rem; box-sizing:border-box; transition:border-color 0.2s;" onfocus="this.style.borderColor='#007bff'" onblur="this.style.borderColor='#e5e7eb'">
                    </div>
                    <div>
                        <label style="display:block; margin-bottom:8px; font-weight:600; color:#374151; font-size:0.95rem;">Max Guests *</label>
                        <input type="number" name="maxGuests" required min="1" placeholder="1" style="width:100%; padding:12px 14px; border:2px solid #e5e7eb; border-radius:8px; color:#000; background:#fff; font-size:1rem; box-sizing:border-box; transition:border-color 0.2s;" onfocus="this.style.borderColor='#007bff'" onblur="this.style.borderColor='#e5e7eb'">
                    </div>
                </div>
            </div>
            
            <!-- Amenities & Status Section -->
            <div style="margin-bottom:28px;">
                <h3 style="margin:0 0 16px 0; color:#0b1220; font-size:1.1rem; font-weight:600; padding-bottom:8px; border-bottom:2px solid #e9ecef;">✨ Amenities & Status</h3>
                
                <div style="margin-bottom:18px;">
                    <label style="display:block; margin-bottom:8px; font-weight:600; color:#374151; font-size:0.95rem;">Amenities</label>
                    <input type="text" name="amenities" placeholder="WiFi, Pool, Parking, Kitchen..." style="width:100%; padding:12px 14px; border:2px solid #e5e7eb; border-radius:8px; color:#000; background:#fff; font-size:1rem; box-sizing:border-box; transition:border-color 0.2s;" onfocus="this.style.borderColor='#007bff'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                
                <label style="display:flex; align-items:center; gap:10px; padding:12px; background:#f9fafb; border-radius:8px; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='#f9fafb'">
                    <input type="checkbox" name="isActive" style="width:20px; height:20px; cursor:pointer;">
                    <span style="font-weight:600; color:#374151; font-size:0.95rem;">Active Listing (Visible to customers)</span>
                </label>
            </div>
            
            <!-- Images Section -->
            <div style="margin-bottom:28px;">
                <h3 style="margin:0 0 16px 0; color:#0b1220; font-size:1.1rem; font-weight:600; padding-bottom:8px; border-bottom:2px solid #e9ecef;">📷 Images</h3>
                
                <div style="display:flex; gap:12px; margin-bottom:14px;">
                    <button type="button" id="btn-file" style="padding:10px 20px; background:#007bff; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:0.95rem; transition:background 0.2s;" onmouseover="this.style.background='#0056b3'" onmouseout="this.style.background='#007bff'">📁 Upload Files</button>
                    <button type="button" id="btn-url" style="padding:10px 20px; background:#6c757d; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:0.95rem; transition:background 0.2s;" onmouseover="this.style.background='#5a6268'" onmouseout="this.style.background='#6c757d'">🔗 Paste URLs</button>
                </div>
                
                <div id="file-input-container" style="display:block;">
                    <input type="file" id="image-input" accept="image/*" multiple style="padding:10px; border:2px dashed #d1d5db; border-radius:8px; width:100%; box-sizing:border-box; background:#fafafa; cursor:pointer; font-size:0.9rem;">
                    <div id="image-preview" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(120px, 1fr)); gap:12px; margin-top:12px;"></div>
                </div>
                
                <div id="url-input-container" style="display:none;">
                    <textarea id="url-input" placeholder="Paste image URLs (one per line)" rows="4" style="width:100%; padding:12px 14px; border:2px solid #e5e7eb; border-radius:8px; color:#000; background:#fff; font-size:1rem; box-sizing:border-box; resize:vertical;"></textarea>
                </div>
            </div>
            
            <div id="edit-error" style="color:#dc3545; margin-bottom:15px; padding:12px; background:#ffe6e6; border-radius:8px; display:none; font-weight:500;"></div>
            
            <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:30px; padding-top:24px; border-top:2px solid #e9ecef;">
                <button type="button" id="edit-cancel" style="padding:13px 32px; background:#6c757d; color:white; border:none; border-radius:8px; cursor:pointer; font-size:1rem; font-weight:600; transition:background 0.2s;" onmouseover="this.style.background='#5a6268'" onmouseout="this.style.background='#6c757d'">Cancel</button>
                <button type="submit" style="padding:13px 32px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-size:1rem; font-weight:600; transition:background 0.2s; box-shadow:0 2px 4px rgba(40,167,69,0.2);" onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'">💾 Save Changes</button>
            </div>
        </form>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Get elements and set values
    const form = modalContent.querySelector('#edit-form');
    form.querySelector('[name="title"]').value = property.title || '';
    form.querySelector('[name="description"]').value = property.description || '';
    form.querySelector('[name="location"]').value = property.location || '';
    form.querySelector('[name="pricePerNight"]').value = property.pricePerNight || '';
    form.querySelector('[name="maxGuests"]').value = property.maxGuests || '';
    form.querySelector('[name="amenities"]').value = property.amenities || '';
    form.querySelector('[name="isActive"]').checked = property.isActive || false;
    const btnFile = modalContent.querySelector('#btn-file');
    const btnUrl = modalContent.querySelector('#btn-url');
    const fileContainer = modalContent.querySelector('#file-input-container');
    const urlContainer = modalContent.querySelector('#url-input-container');
    const imageInput = modalContent.querySelector('#image-input');
    const imagePreview = modalContent.querySelector('#image-preview');
    const urlInput = modalContent.querySelector('#url-input');
    
    // Toggle mode
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
                modalContent.querySelector('#edit-error').textContent = 'Failed to update property';
            }
        } catch (err) {
            modalContent.querySelector('#edit-error').textContent = 'Error: ' + err.message;
        }
    });
    
    // Close modal
    modalContent.querySelector('#edit-cancel').addEventListener('click', () => {
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
