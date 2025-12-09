// Customer Reviews Page - View and manage reviews written by customer
// Features: Edit reviews, update ratings and comments, view provider replies

const customerId = localStorage.getItem('customerId');

// Load all reviews written by this customer
async function loadReviews() {
    if (!customerId) {
        window.location.href = 'customer-login.html';
        return;
    }

    try {
        const response = await fetch(`/api/reviews/customer/${customerId}`);
        const reviews = await response.json();
        
        const container = document.getElementById('reviewsContainer');
        
        if (reviews.length === 0) {
            container.innerHTML = '<p style="color:#6b7280;">You haven\'t written any reviews yet.</p>';
            return;
        }

        container.innerHTML = reviews.map(review => `
            <div style="background:white; padding:20px; border-radius:12px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:15px;">
                    <div>
                        <h3 style="margin:0; color:#0b1220;">${review.property?.title || 'Property'}</h3>
                        <div style="color:#f59e0b; font-size:1.2rem; margin-top:5px;">${'⭐'.repeat(review.rating)}</div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button onclick="editReview(${review.id})" style="padding:8px 16px; background:#007bff; color:white; border:none; border-radius:6px; cursor:pointer;">Edit</button>
                        <button onclick="deleteReview(${review.id})" style="padding:8px 16px; background:#dc3545; color:white; border:none; border-radius:6px; cursor:pointer;">Delete</button>
                    </div>
                </div>
                <p style="color:#374151; margin:10px 0;">${review.comment || ''}</p>
                ${review.providerReply ? `
                    <div style="background:#f3f4f6; padding:15px; border-radius:8px; margin-top:15px; border-left:4px solid #007bff;">
                        <p style="font-weight:600; color:#0b1220; margin:0 0 5px 0;">Provider Response:</p>
                        <p style="color:#374151; margin:0;">${review.providerReply}</p>
                    </div>
                ` : ''}
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading reviews:', err);
    }
}

window.editReview = async function(reviewId) {
    const response = await fetch(`/api/reviews/${reviewId}`);
    const review = await response.json();
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:1000;';
    
    const content = document.createElement('div');
    content.style.cssText = 'background:white; padding:30px; border-radius:12px; width:90%; max-width:500px; box-shadow:0 10px 40px rgba(0,0,0,0.3);';
    
    content.innerHTML = `
        <h2 style="margin-top:0; color:#0b1220;">Edit Review</h2>
        <form id="editReviewForm" style="display:grid; gap:15px;">
            <div>
                <label style="font-weight:600; color:#0b1220; display:block; margin-bottom:5px;">Rating</label>
                <select id="rating" style="padding:10px; border:1px solid #d1d5db; border-radius:8px; width:100%;">
                    <option value="5" ${review.rating === 5 ? 'selected' : ''}>⭐⭐⭐⭐⭐ (5)</option>
                    <option value="4" ${review.rating === 4 ? 'selected' : ''}>⭐⭐⭐⭐ (4)</option>
                    <option value="3" ${review.rating === 3 ? 'selected' : ''}>⭐⭐⭐ (3)</option>
                    <option value="2" ${review.rating === 2 ? 'selected' : ''}>⭐⭐ (2)</option>
                    <option value="1" ${review.rating === 1 ? 'selected' : ''}>⭐ (1)</option>
                </select>
            </div>
            <div>
                <label style="font-weight:600; color:#0b1220; display:block; margin-bottom:5px;">Comment</label>
                <textarea id="comment" rows="4" style="padding:10px; border:1px solid #d1d5db; border-radius:8px; width:100%; box-sizing:border-box; font-family:inherit;">${review.comment || ''}</textarea>
            </div>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button type="button" id="cancelBtn" style="flex:1; padding:12px; background:#e5e7eb; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Cancel</button>
                <button type="submit" style="flex:1; padding:12px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Save</button>
            </div>
        </form>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    const close = () => document.body.removeChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    content.querySelector('#cancelBtn').addEventListener('click', close);
    
    content.querySelector('#editReviewForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updatedReview = {
            ...review,
            rating: parseInt(document.getElementById('rating').value),
            comment: document.getElementById('comment').value
        };
        
        try {
            await fetch(`/api/reviews/${reviewId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedReview)
            });
            close();
            loadReviews();
        } catch (err) {
            alert('Error updating review');
        }
    });
};

window.deleteReview = async function(reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) {
        return;
    }
    
    try {
        await fetch(`/api/reviews/${reviewId}`, {
            method: 'DELETE'
        });
        loadReviews();
    } catch (err) {
        console.error('Error deleting review:', err);
        alert('Error deleting review');
    }
};

loadReviews();
