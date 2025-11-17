
(function () {
    try {
        // Storage and state management
        const SUB_KEY = 'chillcrib_subscriptions';
        let pendingSubscriptions = {};
        const subs = JSON.parse(localStorage.getItem(SUB_KEY) || '{}');

        function saveSubs(obj) {
            localStorage.setItem(SUB_KEY, JSON.stringify(obj));
        }

        // Initialize system
        function init() {
            bindRadioEvents();
            bindSaveButton();
            updateDisplay();
            loadActiveSubscriptions();
            updateSaveSection();
            loadExistingSubscriptionsFromDB();
        }

        // Load user's existing subscriptions from database
        async function loadExistingSubscriptionsFromDB() {
            const customerId = localStorage.getItem('customerId');
            if (!customerId) return;

            try {
                const response = await fetch(`/api/subscriptions/customer/${customerId}`);
                if (response.ok) {
                    const dbSubscriptions = await response.json();

                    // Convert database subscriptions to local format
                    dbSubscriptions.forEach(dbSub => {
                        if (dbSub.active) {
                            // Extract service and plan from database plan type
                            const serviceInfo = parseServiceFromPlanType(dbSub.planType);
                            if (serviceInfo) {
                                subs[serviceInfo.service] = {
                                    plan: serviceInfo.plan,
                                    price: dbSub.price,
                                    billing: dbSub.billingCycle,
                                    status: 'active',
                                    dbId: dbSub.id
                                };

                                // Update UI to show active subscription
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

        // Parse database plan type back to service/plan format
        function parseServiceFromPlanType(planType) {
            if (planType.includes('Insurance')) return { service: 'insurance', plan: planType.includes('Yearly') ? 'yearly' : 'monthly' };
            if (planType.includes('Cleaning')) return { service: 'cleaning', plan: planType.includes('Unlimited') ? 'monthly' : 'per-booking' };
            if (planType.includes('Equipment')) return { service: 'equipment', plan: planType.includes('Premium') ? 'premium' : 'basic' };
            return null;
        }

        // Set up radio button click handlers
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

        // Handle when user selects/deselects a subscription plan
        function handleRadioChange(serviceId, plan, price, radio) {
            const serviceCard = radio.closest('.sub-card');

            if (radio.checked) {
                // Add to pending subscriptions (not saved yet)
                pendingSubscriptions[serviceId] = {
                    plan: plan,
                    price: parseFloat(price),
                    billing: getPlanBilling(plan),
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

        // Set up save and cancel button handlers
        function bindSaveButton() {
            const saveBtn = document.getElementById('saveSubscriptions');
            const cancelBtn = document.getElementById('cancelSave');

            if (saveBtn) {
                saveBtn.addEventListener('click', saveSubscriptionsToDatabase);
            }

            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    // Clear pending changes and reset to saved state
                    pendingSubscriptions = {};
                    resetToSavedState();
                    updateSaveSection();
                    showSuccessMessage('Selection reset to saved state');
                });
            }
        }

        // Reset UI to match currently saved subscriptions
        function resetToSavedState() {
            // Uncheck all radio buttons
            document.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.checked = false;
            });
            document.querySelectorAll('.sub-card').forEach(card => {
                card.classList.remove('active');
            });

            // Re-check saved subscriptions
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

        // Show/hide save section and build pricing summary
        function updateSaveSection() {
            const saveSection = document.getElementById('saveSection');
            const summary = document.getElementById('selectedSummary');
            const pendingKeys = Object.keys(pendingSubscriptions);

            if (pendingKeys.length === 0) {
                saveSection.style.display = 'none';
                return;
            }

            saveSection.style.display = 'block';

            // Build pricing summary HTML
            let summaryHTML = '';
            let totalMonthly = 0;

            pendingKeys.forEach(serviceId => {
                const sub = pendingSubscriptions[serviceId];
                const billing = getPlanBilling(sub.plan);

                // Calculate monthly equivalent for totals
                let monthlyPrice = sub.price;
                if (billing === 'year') monthlyPrice = sub.price / 12;
                if (billing === 'booking') monthlyPrice = 0;

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

            // Add estimated total if calculable
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

        // Save pending subscriptions to database
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

            // Show loading state
            const saveBtn = document.getElementById('saveSubscriptions');
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner"></span>Saving...';

            try {
                // Get customer data for database association
                const customerResponse = await fetch(`/api/customers/${customerId}`);
                if (!customerResponse.ok) {
                    throw new Error('Failed to load customer information');
                }
                const customer = await customerResponse.json();

                // Cancel existing subscriptions being replaced
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

                    // Map to backend subscription types
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

                // Save each subscription to database
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

                            // Update local data with database info
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
                    // Update local storage and UI
                    saveSubs(subs);

                    // Clear pending changes
                    pendingSubscriptions = {};
                    updateSaveSection();
                    loadActiveSubscriptions();

                    showSuccessMessage(`${savedCount} subscription(s) saved successfully! Your subscriptions are now active.`);

                } else {
                    throw new Error('Failed to save subscriptions');
                }

            } catch (error) {
                console.error('Error saving subscriptions:', error);
                showErrorMessage('Error saving subscriptions. Please try again.');
            } finally {
                // Reset save button state
                saveBtn.disabled = false;
                saveBtn.innerHTML = 'Save & Continue';
            }
        }

        // Display active subscriptions with remove buttons
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

        // Create HTML for active subscription item
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
                    <button class="btn-remove" data-service="${serviceId}">✕ Remove</button>
                </div>
            `;

            // Bind remove button click
            div.querySelector('.btn-remove').addEventListener('click', () => cancelSubscription(serviceId));

            return div;
        }

        // Remove subscription from database and UI
        async function cancelSubscription(serviceId) {
            try {
                // Cancel subscription in database
                if (subs[serviceId] && subs[serviceId].dbId) {
                    const response = await fetch(`/api/subscriptions/${subs[serviceId].dbId}/cancel`, {
                        method: 'POST'
                    });

                    if (!response.ok) {
                        throw new Error('Failed to cancel subscription in database');
                    }
                }

                // Remove from local storage and update UI
                delete subs[serviceId];
                saveSubs(subs);

                // Uncheck radio buttons for this service
                const serviceCard = document.querySelector(`[data-id="${serviceId}"]`);
                if (serviceCard) {
                    serviceCard.querySelectorAll('input[type="radio"]').forEach(radio => {
                        radio.checked = false;
                    });
                    serviceCard.classList.remove('active');
                }

                loadActiveSubscriptions();

            } catch (error) {
                console.error('Error cancelling subscription:', error);
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
            document.querySelectorAll('.sub-card').forEach(card => {
                const serviceId = card.getAttribute('data-id');
                if (subs[serviceId] && subs[serviceId].status === 'active') {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        }

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

        function showSuccessMessage(message) {
            showMessage(message, false);
        }

        function showErrorMessage(message) {
            showMessage(message, true);
        }

        // Export functions for other pages
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