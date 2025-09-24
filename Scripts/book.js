// Booking page behaviour: populate title/price and save booking to localStorage
(function () {
    try {
        const titleEl = document.getElementById('title');
        const form = document.getElementById('bookingForm');
        if (!form) return;

        const params = new URLSearchParams(location.search);
        const rawTitle = params.get('title') || 'Chosen Crib';
        const price = params.get('price') || '';
        if (titleEl) titleEl.textContent = `Book — ${decodeURIComponent(rawTitle)}`;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const booking = {
                title: decodeURIComponent(rawTitle),
                price: price,
                guestName: document.getElementById('guestName')?.value || '',
                checkin: document.getElementById('checkin')?.value || '',
                checkout: document.getElementById('checkout')?.value || '',
                guests: document.getElementById('guests')?.value || '1',
                createdAt: Date.now()
            };
            const key = 'chillcrib_bookings';
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(booking);
            localStorage.setItem(key, JSON.stringify(existing));
            location.href = 'DashBoard.html';
        });
    } catch (e) { console.error('booking script failed', e); }
})();