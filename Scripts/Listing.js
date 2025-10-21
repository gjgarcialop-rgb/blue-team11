// Listing page behaviors: booking bar sync and per-listing reviews
(function () {
    try {
        const titleEl = document.getElementById('listingTitle');
        const priceEl = document.getElementById('listingPrice');
        const titleTarget = document.querySelector('.booking-title');
        const priceTarget = document.querySelector('.booking-price');
        if (titleEl && titleTarget) titleTarget.textContent = titleEl.textContent;
        if (priceEl && priceTarget) priceTarget.textContent = priceEl.textContent;
    } catch (e) { /* ignore */ }

    // Reuse the reviews implementation only if elements exist
    (function initListingReviews() {
        function keyFor(title) { return 'reviews::' + title.replace(/\s+/g, '_'); }
        function escapeHtml(s) { return (s || '').replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" })[c]; }); }

        const title = document.getElementById('listingTitle')?.textContent || null;
        const listEl = document.getElementById('listingReviews');
        const form = document.getElementById('listingReviewForm');
        if (!title || !listEl || !form) return;

        const stars = Array.from(document.querySelectorAll('#listingStarRating .star'));
        let currentRating = 5;

        function loadReviews() { try { return JSON.parse(localStorage.getItem(keyFor(title)) || '[]'); } catch (e) { return []; } }
        function saveReviews(arr) { localStorage.setItem(keyFor(title), JSON.stringify(arr || [])); }

        function renderReviews() {
            const items = loadReviews();
            listEl.innerHTML = '';
            if (!items.length) { listEl.innerHTML = '<p class="muted">No reviews yet for this listing.</p>'; return; }
            items.slice().reverse().forEach((r, idx) => {
                const originalIndex = items.length - 1 - idx;
                const div = document.createElement('div'); div.className = 'review-item';
                div.innerHTML = `
          <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          <div class="review-guest muted">by ${escapeHtml(r.guest || 'Guest')}</div>
          <div class="review-text">${escapeHtml(r.text)}</div>
          <div class="review-item-actions" style="margin-top:8px">
            <button class="btn ghost remove-review" data-index="${originalIndex}">Remove</button>
          </div>`;
                listEl.appendChild(div);
            });
            listEl.querySelectorAll('.remove-review').forEach(btn => btn.addEventListener('click', function () { const i = parseInt(this.getAttribute('data-index')); const arr = loadReviews(); arr.splice(i, 1); saveReviews(arr); renderReviews(); }));
        }

        function highlightStars(v) { stars.forEach(s => { const val = parseInt(s.getAttribute('data-value')) || 0; s.textContent = (val <= v ? '★' : '☆'); }); }
        function updateStars() { highlightStars(currentRating); }
        stars.forEach(s => { s.addEventListener('click', () => { currentRating = parseInt(s.getAttribute('data-value')) || 1; updateStars(); }); s.addEventListener('mouseover', () => { const v = parseInt(s.getAttribute('data-value')) || 0; highlightStars(v); }); s.addEventListener('mouseout', () => updateStars()); });
        updateStars();

        form.addEventListener('submit', function (e) { e.preventDefault(); const text = (document.getElementById('reviewText')?.value || '').trim(); const guest = (document.getElementById('reviewGuest')?.value || '').trim() || 'Guest'; if (!text) { alert('Please enter a review'); return; } const arr = loadReviews(); arr.push({ rating: currentRating, text: text, guest: guest, createdAt: Date.now() }); saveReviews(arr); document.getElementById('reviewText').value = ''; document.getElementById('reviewGuest').value = ''; currentRating = 5; updateStars(); renderReviews(); });
        renderReviews();
    })();
})();
