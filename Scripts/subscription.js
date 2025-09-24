// subscription toggles
(function () {
    try {
        const SUB_KEY = 'chillcrib_subscriptions';
        function loadSubs() { return JSON.parse(localStorage.getItem(SUB_KEY) || '{}'); }
        function saveSubs(obj) { localStorage.setItem(SUB_KEY, JSON.stringify(obj)); }

        const subs = loadSubs();
        const cards = document.querySelectorAll('.sub-card');
        if (!cards.length) return;
        cards.forEach(card => {
            const id = card.getAttribute('data-id');
            const btn = card.querySelector('button[data-action]');
            if (!btn) return;
            function update() {
                if (subs[id]) { card.classList.add('active'); btn.textContent = 'Subscribed'; }
                else { card.classList.remove('active'); btn.textContent = (id === 'insurance' ? 'Subscribe' : 'Add'); }
            }
            update();
            btn.addEventListener('click', () => {
                subs[id] = !subs[id];
                saveSubs(subs);
                update();
            });
        });
    } catch (e) { console.error('subscription script failed', e); }
})();