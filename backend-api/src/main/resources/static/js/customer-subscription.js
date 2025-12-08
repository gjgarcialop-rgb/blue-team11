(function () {
    // Storage for pending and saved subscriptions
    let pending = {};
    let subs = {};

    // Get customer-specific storage key
    function getStorageKey() {
        const customerId = localStorage.getItem('customerId');
        return customerId ? `chillcrib_subscriptions_${customerId}` : 'chillcrib_subscriptions';
    }

    // Load subscriptions from localStorage (customer-specific)
    function loadLocalSubs() {
        subs = JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
    }

    // Save subscriptions to localStorage (customer-specific)
    function save() {
        localStorage.setItem(getStorageKey(), JSON.stringify(subs));
    }

    // Initialize subscription system
    function init() {
        loadLocalSubs(); // Load customer-specific subscriptions first
        setupRadios();
        setupButtons();
        loadFromDB();
        showActive();
        updateSummary();
    }

    // Load existing subscriptions from database
    async function loadFromDB() {
        const customerId = localStorage.getItem('customerId');
        if (!customerId) return;

        try {
            const response = await fetch(`/api/subscriptions/customer/${customerId}`);
            if (!response.ok) return;
            
            const dbSubs = await response.json();
            dbSubs.forEach(dbSub => {
                if (!dbSub.active) return;
                
                const service = getServiceFromPlan(dbSub.planType);
                if (!service) return;
                
                subs[service.service] = {
                    plan: service.plan,
                    price: dbSub.price,
                    billing: dbSub.billingCycle,
                    status: 'active',
                    dbId: dbSub.id
                };

                // Check the radio and highlight card
                const card = document.querySelector(`[data-id="${service.service}"]`);
                if (card) {
                    const radio = card.querySelector(`input[data-plan="${service.plan}"]`);
                    if (radio) {
                        radio.checked = true;
                        card.classList.add('active');
                    }
                }
            });
            save();
            showActive();
        } catch (error) {
            console.error('Load error:', error);
        }
    }

    // Map database plan types to service info
    function getServiceFromPlan(planType) {
        if (planType.includes('Insurance')) return { service: 'insurance', plan: planType.includes('Yearly') ? 'yearly' : 'monthly' };
        if (planType.includes('Cleaning')) return { service: 'cleaning', plan: planType.includes('Unlimited') ? 'monthly' : 'per-booking' };
        if (planType.includes('Equipment')) return { service: 'equipment', plan: planType.includes('Premium') ? 'premium' : 'basic' };
        return null;
    }

    // Setup radio button event handlers
    // this is local storage why did we use it?
    function setupRadios() {
        document.querySelectorAll('.sub-option input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                if (!radio.checked) return;

                const card = radio.closest('.sub-card');
                const serviceId = card.dataset.id;
                const plan = radio.dataset.plan;
                const price = parseFloat(radio.dataset.price);

                pending[serviceId] = {
                    plan: plan,
                    price: price,
                    billing: getBilling(plan),
                    status: 'pending'
                };

                card.classList.add('active');
                updateSummary();
            });
        });
    }

    // Setup action buttons
    function setupButtons() {
        const saveBtn = document.getElementById('saveSubscriptions');
        const cancelBtn = document.getElementById('cancelSave');

        if (saveBtn) saveBtn.addEventListener('click', saveToDatabase);
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                pending = {};
                resetRadios();
                updateSummary();
            });
        }
    }

    // this is local storage why did we use it again?
    function resetRadios() {
        document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
        document.querySelectorAll('.sub-card').forEach(card => card.classList.remove('active'));

        Object.keys(subs).forEach(serviceId => {
            const sub = subs[serviceId];
            const card = document.querySelector(`[data-id="${serviceId}"]`);
            if (card && sub.status === 'active') {
                const radio = card.querySelector(`input[data-plan="${sub.plan}"]`);
                if (radio) {
                    radio.checked = true;
                    card.classList.add('active');
                }
            }
        });
    }

    // Update subscription summary display
    function updateSummary() {
        const saveSection = document.getElementById('saveSection');
        const summary = document.getElementById('selectedSummary');
        const pendingKeys = Object.keys(pending);

        if (pendingKeys.length === 0) {
            saveSection.style.display = 'none';
            return;
        }

        saveSection.style.display = 'block';
        let html = '';
        let total = 0;

        pendingKeys.forEach(serviceId => {
            const sub = pending[serviceId];
            const billing = getBilling(sub.plan);
            
            if (billing === 'year') total += sub.price / 12;
            if (billing === 'month') total += sub.price;

            html += `
                <div class="summary-item">
                    <div>
                        <div class="summary-service">${getServiceName(serviceId)}</div>
                        <div class="summary-plan">${getPlanName(sub.plan)}</div>
                    </div>
                    <div class="summary-price">$${sub.price}/${billing}</div>
                </div>
            `;
        });

        if (total > 0) {
            html += `
                <div class="summary-item" style="border-top: 2px solid rgba(255,255,255,0.3); margin-top: 12px; padding-top: 12px;">
                    <div class="summary-service">Estimated Monthly Total</div>
                    <div class="summary-price">$${total.toFixed(2)}/month</div>
                </div>
            `;
        }

        summary.innerHTML = html;
    }

    // Save subscriptions to database
    async function saveToDatabase() {
        const customerId = localStorage.getItem('customerId');
        if (!customerId) {
            // alert removed
            return;
        }

        const pendingKeys = Object.keys(pending);
        if (pendingKeys.length === 0) return;

        const saveBtn = document.getElementById('saveSubscriptions');
        saveBtn.disabled = true;
        saveBtn.innerHTML = 'Saving...';

        try {
            const customerResponse = await fetch(`/api/customers/${customerId}`);
            const customer = await customerResponse.json();

            // Cancel existing subscriptions being replaced
            for (const serviceId of pendingKeys) {
                if (subs[serviceId] && subs[serviceId].dbId) {
                    await fetch(`/api/subscriptions/${subs[serviceId].dbId}/cancel`, { method: 'POST' });
                }
            }

            // Save new subscriptions
            for (const serviceId of pendingKeys) {
                const sub = pending[serviceId];
                
                const data = {
                    customer: customer,
                    type: serviceId === 'equipment' && sub.plan === 'premium' ? 'PREMIUM' : serviceId === 'insurance' ? 'PREMIUM' : 'BASIC',
                    planType: `${getServiceName(serviceId)} - ${getPlanName(sub.plan)}`,
                    price: sub.price,
                    billingCycle: sub.billing,
                    startDate: new Date().toISOString(),
                    active: true
                };

                const response = await fetch('/api/subscriptions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const savedSub = await response.json();
                    subs[serviceId] = {
                        ...pending[serviceId],
                        status: 'active',
                        dbId: savedSub.id
                    };
                }
            }

            save();
            pending = {};
            updateSummary();
            showActive();
            showMessage('Subscriptions saved successfully!');

        } catch (error) {
            console.error('Save error:', error);
            showMessage('Failed to save subscriptions', true);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Save & Continue';
        }
    }

    // Display active subscriptions
    function showActive() {
        const activeSection = document.getElementById('activeSubscriptions');
        const activeList = document.getElementById('activeSubsList');
        if (!activeList) return;

        const activeServices = Object.keys(subs).filter(serviceId => subs[serviceId].status === 'active');

        if (activeServices.length === 0) {
            activeSection.style.display = 'none';
            return;
        }

        activeSection.style.display = 'block';
        activeList.innerHTML = '';

        activeServices.forEach(serviceId => {
            const sub = subs[serviceId];
            const div = document.createElement('div');
            div.className = 'active-sub-item';

            div.innerHTML = `
                <div class="sub-info">
                    <h4>${getServiceName(serviceId)}</h4>
                    <div class="sub-details">
                        ${getPlanName(sub.plan)} - $${sub.price}/${getBilling(sub.plan)}
                    </div>
                </div>
                <div class="sub-actions">
                    <button class="btn-remove" onclick="removeSub('${serviceId}')">✕ Remove</button>
                </div>
            `;

            activeList.appendChild(div);
        });
    }

    window.removeSub = async function(serviceId) {
        try {
            if (subs[serviceId] && subs[serviceId].dbId) {
                await fetch(`/api/subscriptions/${subs[serviceId].dbId}/cancel`, { method: 'POST' });
            }

            delete subs[serviceId];
            save();

            // Uncheck radio buttons
            const card = document.querySelector(`[data-id="${serviceId}"]`);
            if (card) {
                card.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
                card.classList.remove('active');
            }

            showActive();
        } catch (error) {
            console.error('Remove error:', error);
        }
    };

    // Helper functions
    function getServiceName(serviceId) {
        const names = {
            'insurance': 'Insurance & Protection',
            'cleaning': 'Cleaning Service',
            'equipment': 'Rental Equipment'
        };
        return names[serviceId] || serviceId;
    }

    function getPlanName(plan) {
        const names = {
            'monthly': 'Monthly',
            'yearly': 'Yearly',
            'per-booking': 'Per Booking',
            'basic': 'Basic',
            'premium': 'Premium'
        };
        return names[plan] || plan;
    }

    // Get billing cycle for plan
    function getBilling(plan) {
        const billing = {
            'monthly': 'month',
            'yearly': 'year',
            'per-booking': 'booking',
            'basic': 'booking',
            'premium': 'month'
        };
        return billing[plan] || 'month';
    }

    // Show success or error message
    function showMessage(message, isError = false) {
        const existing = document.querySelector('.success-message, .error-message');
        if (existing) existing.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = isError ? 'error-message' : 'success-message';
        messageDiv.textContent = message;

        const container = document.querySelector('.container');
        const firstSection = container.querySelector('section');
        container.insertBefore(messageDiv, firstSection);

        setTimeout(() => {
            if (messageDiv.parentNode) messageDiv.remove();
        }, 4000);
    }

    // Export for other pages
    window.ChillCribSubscriptions = {
        getSubscriptions: () => subs,
        getServiceName,
        getPlanName,
        getBilling,
        loadSubscriptionsFromDB: loadFromDB
    };

    // Start when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

