// Enhanced Customer Subscription Management System
(function () {
    try {
        const SUB_KEY = 'chillcrib_subscriptions';
        const CUSTOMER_KEY = 'chillcrib_customer';

        // Subscription management functions
        function loadSubs() { 
            return JSON.parse(localStorage.getItem(SUB_KEY) || '{}'); 
        }
        
        function saveSubs(obj) { 
            localStorage.setItem(SUB_KEY, JSON.stringify(obj)); 
        }

        function loadCustomer() {
            return JSON.parse(localStorage.getItem(CUSTOMER_KEY) || '{}');
        }

        // Initialize subscription manager
        let isEditMode = false;
        let pendingSubscriptions = {}; // Track pending subscriptions before save
        const subs = loadSubs();

        // Initialize
        function init() {
            bindRadioEvents();
            bindEditButton();
            bindSaveButton();
            updateDisplay();
            loadActiveSubscriptions();
            updateSaveSection();
            loadExistingSubscriptionsFromDB();
        }

        // Load existing subscriptions from database
        async function loadExistingSubscriptionsFromDB() {
            const customerId = localStorage.getItem('customerId');
            if (!customerId) return;

            try {
                const response = await fetch(`/api/subscriptions/customer/${customerId}`);
                if (response.ok) {
                    const dbSubscriptions = await response.json();
                    
                    // Convert DB subscriptions to local format and update UI
                    dbSubscriptions.forEach(dbSub => {
                        if (dbSub.active) {
                            // Parse the plan type to extract service and plan
                            const serviceInfo = parseServiceFromPlanType(dbSub.planType);
                            if (serviceInfo) {
                                subs[serviceInfo.service] = {
                                    service: serviceInfo.service,
                                    plan: serviceInfo.plan,
                                    price: dbSub.price,
                                    billing: dbSub.billingCycle,
                                    startDate: dbSub.startDate,
                                    status: 'active',
                                    dbId: dbSub.id
                                };
                                
                                // Update radio button to reflect saved state
                                const serviceCard = document.querySelector(`[data-id="${serviceInfo.service}"]`);
                                if (serviceCard) {
                                    const radio = serviceCard.querySelector(`input[data-plan="${serviceInfo.plan}"]`);
                                    if (radio) {
                                        radio.checked = true;
                                        serviceCard.classList.add('active');
                                    }
                                }
                            }
                        }
                    });
                    
                    saveSubs(subs);
                    loadActiveSubscriptions();
                }
            } catch (error) {
                console.error('Error loading existing subscriptions:', error);
            }
        }

        // Parse service info from database plan type
        function parseServiceFromPlanType(planType) {
            if (planType.includes('Insurance')) return { service: 'insurance', plan: planType.includes('Yearly') ? 'yearly' : 'monthly' };
            if (planType.includes('Cleaning')) return { service: 'cleaning', plan: planType.includes('Unlimited') ? 'monthly' : 'per-booking' };
            if (planType.includes('Equipment')) return { service: 'equipment', plan: planType.includes('Premium') ? 'premium' : 'basic' };
            return null;
        }

        // Bind radio button events
        function bindRadioEvents() {
            document.querySelectorAll('.sub-option input[type="radio"]').forEach(radio => {
                const serviceCard = radio.closest('.sub-card');
                const serviceId = serviceCard.getAttribute('data-id');
                const plan = radio.getAttribute('data-plan');
                const price = radio.getAttribute('data-price');

                radio.addEventListener('change', () => {
                    handleRadioChange(serviceId, plan, price, radio);
                });
            });
        }

        // Handle radio button changes
        function handleRadioChange(serviceId, plan, price, radio) {
            const serviceCard = radio.closest('.sub-card');
            
            if (radio.checked) {
                // Add to pending subscriptions
                pendingSubscriptions[serviceId] = {
                    service: serviceId,
                    plan: plan,
                    price: parseFloat(price),
                    billing: getPlanBilling(plan),
                    startDate: new Date().toISOString(),
                    status: 'pending'
                };
                
                serviceCard.classList.add('active');
                showSuccessMessage(`Selected ${getServiceName(serviceId)} - ${getPlanName(plan)}`);
                
            } else {
                // Remove from pending subscriptions
                delete pendingSubscriptions[serviceId];
                serviceCard.classList.remove('active');
            }
            
            updateSaveSection();
        }

        // Bind save button
        function bindSaveButton() {
            const saveBtn = document.getElementById('saveSubscriptions');
            const cancelBtn = document.getElementById('cancelSave');
            
            if (saveBtn) {
                saveBtn.addEventListener('click', saveSubscriptionsToDatabase);
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    // Clear pending subscriptions
                    pendingSubscriptions = {};
                    // Reset radio buttons to saved state
                    resetToSavedState();
                    updateSaveSection();
                    showSuccessMessage('Selection reset to saved state');
                });
            }
        }

        // Reset radio buttons to saved state
        function resetToSavedState() {
            // First uncheck all
            document.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.checked = false;
            });
            document.querySelectorAll('.sub-card').forEach(card => {
                card.classList.remove('active');
            });

            // Then check saved subscriptions
            Object.keys(subs).forEach(serviceId => {
                const sub = subs[serviceId];
                const serviceCard = document.querySelector(`[data-id="${serviceId}"]`);
                if (serviceCard && sub.status === 'active') {
                    const radio = serviceCard.querySelector(`input[data-plan="${sub.plan}"]`);
                    if (radio) {
                        radio.checked = true;
                        serviceCard.classList.add('active');
                    }
                }
            });
        }

        // Update save section visibility and content
        function updateSaveSection() {
            const saveSection = document.getElementById('saveSection');
            const summary = document.getElementById('selectedSummary');
            const pendingKeys = Object.keys(pendingSubscriptions);
            
            if (pendingKeys.length === 0) {
                saveSection.style.display = 'none';
                return;
            }
            
            saveSection.style.display = 'block';
            
            // Build summary
            let summaryHTML = '';
            let totalMonthly = 0;
            
            pendingKeys.forEach(serviceId => {
                const sub = pendingSubscriptions[serviceId];
                const billing = getPlanBilling(sub.plan);
                
                // Calculate monthly equivalent for total
                let monthlyPrice = sub.price;
                if (billing === 'year') monthlyPrice = sub.price / 12;
                if (billing === 'booking') monthlyPrice = 0; // Can't calculate
                
                totalMonthly += monthlyPrice;
                
                summaryHTML += `
                    <div class="summary-item">
                        <div>
                            <div class="summary-service">${getServiceName(serviceId)}</div>
                            <div class="summary-plan">${getPlanName(sub.plan)}</div>
                        </div>
                        <div class="summary-price">$${sub.price}/${billing}</div>
                    </div>
                `;
            });
            
            // Add total if applicable
            if (totalMonthly > 0) {
                summaryHTML += `
                    <div class="summary-item" style="border-top: 2px solid rgba(255,255,255,0.3); margin-top: 12px; padding-top: 12px;">
                        <div class="summary-service">Estimated Monthly Total</div>
                        <div class="summary-price">$${totalMonthly.toFixed(2)}/month</div>
                    </div>
                `;
            }
            
            summary.innerHTML = summaryHTML;
        }

        // Save subscriptions to database
        async function saveSubscriptionsToDatabase() {
            const customerId = localStorage.getItem('customerId');
            if (!customerId) {
                alert('Please log in to save subscriptions');
                window.location.href = 'customer-login.html';
                return;
            }
            
            const pendingKeys = Object.keys(pendingSubscriptions);
            if (pendingKeys.length === 0) {
                showSuccessMessage('No new subscriptions to save');
                return;
            }
            
            const saveBtn = document.getElementById('saveSubscriptions');
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner"></span>Saving...';
            
            try {
                // First, get the customer object
                const customerResponse = await fetch(`/api/customers/${customerId}`);
                if (!customerResponse.ok) {
                    throw new Error('Failed to load customer information');
                }
                const customer = await customerResponse.json();
                
                // Cancel existing subscriptions for services being updated
                for (const serviceId of pendingKeys) {
                    if (subs[serviceId] && subs[serviceId].dbId) {
                        try {
                            await fetch(`/api/subscriptions/${subs[serviceId].dbId}/cancel`, {
                                method: 'POST'
                            });
                        } catch (error) {
                            console.warn('Could not cancel existing subscription:', error);
                        }
                    }
                }
                
                // Prepare subscription data for API
                const subscriptionsToSave = pendingKeys.map(serviceId => {
                    const sub = pendingSubscriptions[serviceId];
                    
                    // Map service to subscription type
                    let subscriptionType = 'BASIC';
                    if (serviceId === 'equipment' && sub.plan === 'premium') {
                        subscriptionType = 'PREMIUM';
                    } else if (serviceId === 'insurance') {
                        subscriptionType = 'PREMIUM';
                    }
                    
                    return {
                        customer: customer,
                        type: subscriptionType,
                        planType: `${getServiceName(serviceId)} - ${getPlanName(sub.plan)}`,
                        price: sub.price,
                        billingCycle: sub.billing,
                        startDate: new Date().toISOString(),
                        active: true
                    };
                });
                
                // Save each subscription
                let savedCount = 0;
                for (const subscription of subscriptionsToSave) {
                    try {
                        const response = await fetch('/api/subscriptions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(subscription)
                        });
                        
                        if (response.ok) {
                            const savedSub = await response.json();
                            const serviceId = parseServiceFromPlanType(savedSub.planType).service;
                            
                            // Update local storage with DB info
                            subs[serviceId] = {
                                ...pendingSubscriptions[serviceId],
                                status: 'active',
                                dbId: savedSub.id
                            };
                            savedCount++;
                        } else {
                            const errorText = await response.text();
                            console.error('Failed to save subscription:', subscription, errorText);
                        }
                    } catch (error) {
                        console.error('Error saving subscription:', error);
                    }
                }
                
                if (savedCount > 0) {
                    // Save to local storage
                    saveSubs(subs);
                    
                    // Clear pending subscriptions
                    pendingSubscriptions = {};
                    updateSaveSection();
                    loadActiveSubscriptions();
                    
                    // Show success message
                    showSuccessMessage(`${savedCount} subscription(s) saved successfully! Your subscriptions are now active.`);
                    
                } else {
                    throw new Error('Failed to save subscriptions');
                }
                
            } catch (error) {
                console.error('Error saving subscriptions:', error);
                showErrorMessage('Error saving subscriptions. Please try again.');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = 'Save & Continue';
            }
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
                        ${getPlanName(subscription.plan)} - $${subscription.price}/${billing}
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
        async function cancelSubscription(serviceId) {
            if (!confirm(`Are you sure you want to cancel your ${getServiceName(serviceId)} subscription?`)) {
                return;
            }

            try {
                // Cancel in database if has DB ID
                if (subs[serviceId] && subs[serviceId].dbId) {
                    const response = await fetch(`/api/subscriptions/${subs[serviceId].dbId}/cancel`, {
                        method: 'POST'
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to cancel subscription in database');
                    }
                }
                
                // Remove from local storage
                delete subs[serviceId];
                saveSubs(subs);
                
                // Update UI
                const serviceCard = document.querySelector(`[data-id="${serviceId}"]`);
                if (serviceCard) {
                    serviceCard.querySelectorAll('input[type="radio"]').forEach(radio => {
                        radio.checked = false;
                    });
                    serviceCard.classList.remove('active');
                }
                
                loadActiveSubscriptions();
                showSuccessMessage(`Cancelled ${getServiceName(serviceId)} subscription`);
                
            } catch (error) {
                console.error('Error cancelling subscription:', error);
                showErrorMessage('Error cancelling subscription. Please try again.');
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
                if (subs[serviceId] && subs[serviceId].status === 'active') {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        }

        function showSuccessMessage(message) {
            // Remove existing message
            const existing = document.querySelector('.success-message, .error-message');
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

        function showErrorMessage(message) {
            // Remove existing message
            const existing = document.querySelector('.success-message, .error-message');
            if (existing) existing.remove();

            // Create new message
            const messageDiv = document.createElement('div');
            messageDiv.className = 'error-message';
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

        // Export for other pages (dashboard, homepage)
        window.ChillCribSubscriptions = {
            getSubscriptions: () => subs,
            getServiceName,
            getPlanName,
            getPlanBilling,
            loadSubscriptionsFromDB: loadExistingSubscriptionsFromDB
        };

        // Initialize when DOM loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }

    } catch (e) { 
        console.error('Enhanced subscription script failed', e); 
    }
})();