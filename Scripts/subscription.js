// Enhanced subscription toggles with checkboxes
(function () {
    try {
        const SUB_KEY = 'chillcrib_subscriptions';
        function loadSubs() { return JSON.parse(localStorage.getItem(SUB_KEY) || '{}'); }
        function saveSubs(obj) { localStorage.setItem(SUB_KEY, JSON.stringify(obj)); }

        let isEditMode = false;
        const subs = loadSubs();

        // Initialize
        function init() {
            bindRadioEvents();
            bindEditButton();
            updateDisplay();
            loadActiveSubscriptions();
        }

        // Bind radio button events
        function bindRadioEvents() {
            document.querySelectorAll('.sub-option input[type="radio"]').forEach(radio => {
                const serviceCard = radio.closest('.sub-card');
                const serviceId = serviceCard.getAttribute('data-id');
                const plan = radio.getAttribute('data-plan');
                const price = radio.getAttribute('data-price');

                // Load existing state
                if (subs[serviceId] && subs[serviceId].plan === plan) {
                    radio.checked = true;
                    serviceCard.classList.add('active');
                }

                radio.addEventListener('change', () => {
                    handleRadioChange(serviceId, plan, price, radio);
                });
            });
        }

        // Handle radio button changes
        function handleRadioChange(serviceId, plan, price, radio) {
            const serviceCard = radio.closest('.sub-card');
            
            if (radio.checked) {
                // Subscribe to this plan
                subs[serviceId] = {
                    service: serviceId,
                    plan: plan,
                    price: parseFloat(price),
                    startDate: new Date().toISOString(),
                    status: 'active'
                };
                
                serviceCard.classList.add('active');
                showSuccessMessage(`Subscribed to ${getServiceName(serviceId)} - ${getplanName(plan)}`);
                
            } else {
                // This shouldn't happen with radio buttons, but handle it
                delete subs[serviceId];
                serviceCard.classList.remove('active');
                showSuccessMessage(`Cancelled ${getServiceName(serviceId)} subscription`);
            }
            
            saveSubs(subs);
            updateDisplay();
            loadActiveSubscriptions();
        }

        // Bind edit button
        function bindEditButton() {
            const editBtn = document.getElementById('editMode');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    isEditMode = !isEditMode;
                    editBtn.textContent = isEditMode ? 'Done' : 'Edit';
                    
                    if (isEditMode) {
                        document.body.classList.add('edit-mode');
                    } else {
                        document.body.classList.remove('edit-mode');
                    }
                });
            }
        }

        // Load and display active subscriptions
        function loadActiveSubscriptions() {
            const activeSection = document.getElementById('activeSubscriptions');
            const activeList = document.getElementById('activeSubsList');
            
            const activeServices = Object.keys(subs);
            
            if (activeServices.length === 0) {
                activeSection.style.display = 'none';
                return;
            }
            
            activeSection.style.display = 'block';
            activeList.innerHTML = '';
            
            activeServices.forEach(serviceId => {
                const sub = subs[serviceId];
                const subItem = createActiveSubItem(serviceId, sub);
                activeList.appendChild(subItem);
            });
        }

        // Create active subscription item
        function createActiveSubItem(serviceId, subscription) {
            const div = document.createElement('div');
            div.className = 'active-sub-item';
            
            const billing = getPlanBilling(subscription.plan);
            
            div.innerHTML = `
                <div class="sub-info">
                    <h4>${getServiceName(serviceId)}</h4>
                    <div class="sub-details">
                        ${getplanName(subscription.plan)} - $${subscription.price}/${billing}
                    </div>
                </div>
                <div class="sub-actions">
                    <button class="btn edit" data-service="${serviceId}">Change</button>
                    <button class="btn cancel" data-service="${serviceId}">Cancel</button>
                </div>
            `;
            
            // Bind action buttons
            const changeBtn = div.querySelector('.btn.edit');
            const cancelBtn = div.querySelector('.btn.cancel');
            
            changeBtn.addEventListener('click', () => showChangePlan(serviceId));
            cancelBtn.addEventListener('click', () => cancelSubscription(serviceId));
            
            return div;
        }

        // Show change plan options (simple)
        function showChangePlan(serviceId) {
            const serviceCard = document.querySelector(`[data-id="${serviceId}"]`);
            if (serviceCard) {
                // Scroll to the service card
                serviceCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Highlight the card briefly
                serviceCard.style.border = '3px solid #f59e0b';
                setTimeout(() => {
                    serviceCard.style.border = '';
                }, 2000);
                
                showSuccessMessage('Select a different plan below to change your subscription');
            }
        }

        // Cancel subscription
        function cancelSubscription(serviceId) {
            if (confirm(`Are you sure you want to cancel your ${getServiceName(serviceId)} subscription?`)) {
                // Uncheck all radio buttons for this service
                const serviceCard = document.querySelector(`[data-id="${serviceId}"]`);
                if (serviceCard) {
                    serviceCard.querySelectorAll('input[type="radio"]').forEach(radio => {
                        radio.checked = false;
                    });
                    serviceCard.classList.remove('active');
                }
                
                delete subs[serviceId];
                saveSubs(subs);
                loadActiveSubscriptions();
                showSuccessMessage(`Cancelled ${getServiceName(serviceId)} subscription`);
            }
        }

        // Utility functions
        function getServiceName(serviceId) {
            const names = {
                'insurance': 'Insurance & Protection',
                'cleaning': 'Cleaning Service', 
                'equipment': 'Rental Equipment'
            };
            return names[serviceId] || serviceId;
        }

        function getplanName(plan) {
            const names = {
                'monthly': 'Monthly',
                'yearly': 'Yearly',
                'per-booking': 'Per Booking',
                'basic': 'Basic',
                'premium': 'Premium'
            };
            return names[plan] || plan;
        }

        function getPlanBilling(plan) {
            const billing = {
                'monthly': 'month',
                'yearly': 'year',
                'per-booking': 'booking',
                'basic': 'booking',
                'premium': 'month'
            };
            return billing[plan] || 'month';
        }

        function updateDisplay() {
            // Update card states based on subscriptions
            document.querySelectorAll('.sub-card').forEach(card => {
                const serviceId = card.getAttribute('data-id');
                if (subs[serviceId]) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        }

        function showSuccessMessage(message) {
            // Remove existing message
            const existing = document.querySelector('.success-message');
            if (existing) existing.remove();

            // Create new message
            const messageDiv = document.createElement('div');
            messageDiv.className = 'success-message';
            messageDiv.textContent = message;

            // Insert at top of container
            const container = document.querySelector('.container');
            const firstSection = container.querySelector('section');
            container.insertBefore(messageDiv, firstSection);

            // Remove after 4 seconds
            setTimeout(() => {
                if (messageDiv.parentNode) messageDiv.remove();
            }, 4000);
        }

        // Export for dashboard
        window.ChillCribSubscriptions = {
            getSubscriptions: () => subs,
            getServiceName,
            getplanName,
            getPlanBilling
        };

        // Initialize when DOM loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }

    } catch (e) { 
        console.error('subscription script failed', e); 
    }
})();