// Provider Reviews Page - View and respond to property reviews
// Features: View all reviews for provider's properties, reply to reviews, delete reviews

const providerId = localStorage.getItem('providerId');

// Load all reviews for this provider's properties
async function loadReviews() {
    if (!providerId) {
        window.location.href = 'provider-signin.html';
        return;
    }

    try {
        const propsResponse = await fetch(`/api/properties/provider/${providerId}`);
        const properties = await propsResponse.json();
        
        let allReviews = [];
        
        for (const prop of properties) {
            const reviewsResponse = await fetch(`/api/reviews/property/${prop.id}`);
            const reviews = await reviewsResponse.json();
            allReviews = allReviews.concat(reviews.map(r => ({ ...r, propertyTitle: prop.title })));
        }
        
        const container = document.getElementById('reviewsContainer');
        
        if (allReviews.length === 0) {
            container.innerHTML = '<p style="color:#6b7280;">No reviews yet.</p>';
            return;
        }

        container.innerHTML = allReviews.map(review => `
            <div style="background:white; padding:20px; border-radius:12px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:10px;">
                    <div>
                        <h3 style="margin:0; color:#0b1220;">${review.propertyTitle}</h3>
                        <div style="color:#f59e0b; font-size:1.2rem; margin-top:5px;">${'⭐'.repeat(review.rating)}</div>
                        <p style="color:#6b7280; font-size:0.9rem; margin:5px 0 0 0;">by ${review.customer?.name || review.customer?.email || 'Guest'}</p>
                    </div>
                </div>
                <p style="color:#374151; margin:15px 0;">${review.comment || ''}</p>
                
                ${review.providerReply ? `
                    <div style="background:#f0f9ff; padding:15px; border-radius:8px; margin-top:15px; border-left:4px solid #007bff;">
                        <p style="font-weight:600; color:#0b1220; margin:0 0 5px 0;">Your Response:</p>
                        <p style="color:#374151; margin:0;">${review.providerReply}</p>
                        <button onclick="replyToReview(${review.id}, '${review.providerReply.replace(/'/g, "\\'").replace(/\n/g, ' ')}', true)" style="margin-top:10px; padding:8px 16px; background:#007bff; color:white; border:none; border-radius:6px; cursor:pointer;">Edit Reply</button>
                    </div>
                ` : `
                    <button onclick="replyToReview(${review.id}, '', false)" style="margin-top:10px; padding:8px 16px; background:#28a745; color:white; border:none; border-radius:6px; cursor:pointer;">Reply</button>
                `}
                <button onclick="deleteReview(${review.id})" style="margin-top:10px; padding:8px 16px; background:#dc3545; color:white; border:none; border-radius:6px; cursor:pointer; margin-left:10px;">Delete Review</button>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading reviews:', err);
    }
}

window.replyToReview = function(reviewId, existingReply, isEdit) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:1000;';
    
    const content = document.createElement('div');
    content.style.cssText = 'background:white; padding:30px; border-radius:12px; width:90%; max-width:500px; box-shadow:0 10px 40px rgba(0,0,0,0.3);';
    
    content.innerHTML = `
        <h2 style="margin-top:0; color:#0b1220;">${isEdit ? 'Edit' : 'Write'} Reply</h2>
        <form id="replyForm" style="display:grid; gap:15px;">
            <div>
                <label style="font-weight:600; color:#0b1220; display:block; margin-bottom:5px;">Your Response</label>
                <textarea id="replyText" rows="4" required style="padding:10px; border:1px solid #d1d5db; border-radius:8px; width:100%; box-sizing:border-box; font-family:inherit;">${existingReply}</textarea>
            </div>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button type="button" id="cancelBtn" style="flex:1; padding:12px; background:#e5e7eb; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Cancel</button>
                <button type="submit" style="flex:1; padding:12px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Submit</button>
            </div>
        </form>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    const close = () => document.body.removeChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    content.querySelector('#cancelBtn').addEventListener('click', close);
    
    content.querySelector('#replyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const replyText = document.getElementById('replyText').value;
        
        try {
            const reviewResponse = await fetch(`/api/reviews/${reviewId}`);
            const review = await reviewResponse.json();
            
            const updateData = {
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                providerReply: replyText,
                guestName: review.guestName,
                property: { id: review.property.id },
                customer: { id: review.customer.id }
            };
            
            await fetch(`/api/reviews/${reviewId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            
            close();
            loadReviews();
        } catch (err) {
            console.error('Error submitting reply:', err);
            alert('Error submitting reply');
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
