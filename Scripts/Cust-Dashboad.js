// Dashboard behaviors: render bookings and subscriptions; render reviews if the page includes them
(function () {
  // Upcoming bookings list
  try {
    const key = 'chillcrib_bookings';
    const list = document.getElementById('upcomingList');
    if (list) {
      let bookings = JSON.parse(localStorage.getItem(key) || '[]');
      function renderBookings() {
        list.innerHTML = '';
        if (!bookings.length) {
          list.innerHTML = '<li id="noTrips">No upcoming trips — start searching for your next stay!</li>';
          return;
        }
        bookings.slice().reverse().forEach((b, idx) => {
          const li = document.createElement('li');
          li.className = 'booking-item';
          li.innerHTML = `
            <div class="booking-summary">
              <div><strong>${b.title}</strong></div>
              <div class="muted">${b.checkin} → ${b.checkout} • ${b.guests} guest(s)</div>
            </div>
            <div class="booking-actions">
              <button class="btn ghost" data-index="${bookings.length - 1 - idx}">Remove</button>
              <a class="btn" href="Booking.html?title=${encodeURIComponent(b.title)}&price=${encodeURIComponent(b.price)}">Edit</a>
            </div>
          `;
          list.appendChild(li);
        });
        // attach handlers
        list.querySelectorAll('button[data-index]').forEach(btn => {
          btn.addEventListener('click', function () {
            const i = parseInt(this.getAttribute('data-index'));
            bookings.splice(i, 1);
            localStorage.setItem(key, JSON.stringify(bookings));
            renderBookings();
          });
        });
      }
      renderBookings();
    }
  } catch (e) { console.error('dashboard bookings error', e); }

  // Subscriptions
  try {
    const subs = JSON.parse(localStorage.getItem('chillcrib_subscriptions') || '{}');
    const container = document.getElementById('yourSubs');
    const labels = { insurance: 'Insurance & Protection', cleaning: 'Cleaning Service', equipment: 'Rental Equipment' };
    if (container) {
      const active = Object.keys(subs).filter(k => subs[k]);
      if (!active.length) { container.textContent = 'No active subscriptions'; }
      else {
        container.innerHTML = '';
        active.forEach(k => {
          const div = document.createElement('div');
          div.textContent = labels[k] || k;
          container.appendChild(div);
        });
      }
    }
  } catch (e) { console.error('dashboard subscriptions error', e); }

  // Reviews block (if present on the dashboard page)
  try {
    const RKEY = 'chillcrib_reviews';
    const listEl = document.getElementById('reviewsList');
    const form = document.getElementById('reviewForm');
    if (!listEl || !form) return;

    const stars = Array.from(document.querySelectorAll('#starRating .star'));
    let currentRating = 5;

    function load(){ return JSON.parse(localStorage.getItem(RKEY) || '[]'); }
    function save(arr){ localStorage.setItem(RKEY, JSON.stringify(arr)); }
    function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]; }); }

    function render(){
      const items = load();
      listEl.innerHTML = '';
      if(!items.length){ listEl.innerHTML = '<p class="muted">No reviews yet — leave your first review.</p>'; return; }
      items.slice().reverse().forEach((r, idx) => {
        const origIndex = items.length - 1 - idx;
        const div = document.createElement('div');
        div.className = 'review-item';
        div.innerHTML = `
          <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
          <div class="review-guest muted">by ${escapeHtml(r.guest || 'Guest')}</div>
          <div class="review-text">${escapeHtml(r.text)}</div>
          <div style="margin-top:8px"><button class="btn ghost remove-review" data-index="${origIndex}">Remove</button></div>
        `;
        listEl.appendChild(div);
      });
      // attach remove handlers for reviews
      listEl.querySelectorAll('button.remove-review').forEach(btn => {
        btn.addEventListener('click', function(){
          const i = parseInt(this.getAttribute('data-index'));
          const arr = load(); arr.splice(i,1); save(arr); render();
        });
      });
    }

    // star interactions
    stars.forEach(s => {
      s.addEventListener('click', ()=>{ currentRating = parseInt(s.getAttribute('data-value')) || 1; updateStars(); });
      s.addEventListener('mouseover', ()=>{ const v = parseInt(s.getAttribute('data-value')); highlight(v); });
      s.addEventListener('mouseout', ()=> updateStars());
    });

    function highlight(v){ stars.forEach(s=> s.textContent = (parseInt(s.getAttribute('data-value'))<=v? '★':'☆')); }
    function updateStars(){ highlight(currentRating); }
    updateStars();

    form.addEventListener('submit', function(e){
      e.preventDefault();
      const text = document.getElementById('reviewText').value.trim();
      const guest = document.getElementById('reviewGuest').value.trim() || 'Guest';
      if(!text){ alert('Please enter a review'); return; }
      const reviews = load(); reviews.push({ rating: currentRating, text: text, guest: guest, createdAt: Date.now() }); save(reviews);
      document.getElementById('reviewText').value = ''; document.getElementById('reviewGuest').value = '';
      currentRating = 5; updateStars(); render();
    });

    render();
  } catch (e) { /* reviews block may not be present, ignore */ }

})();