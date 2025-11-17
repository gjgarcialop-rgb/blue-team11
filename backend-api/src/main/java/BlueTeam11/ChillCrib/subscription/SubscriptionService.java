package BlueTeam11.ChillCrib.subscription;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SubscriptionService {
    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    public Subscription createSubscription(Subscription subscription) {
        return subscriptionRepository.save(subscription);
    }

    public Subscription updateSubscription(Long id, Subscription subscriptionDetails) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found"));

        subscription.setType(subscriptionDetails.getType());
        subscription.setPlanType(subscriptionDetails.getPlanType());
        subscription.setPrice(subscriptionDetails.getPrice());
        subscription.setBillingCycle(subscriptionDetails.getBillingCycle());
        subscription.setActive(subscriptionDetails.isActive());
        subscription.setStartDate(subscriptionDetails.getStartDate());
        subscription.setEndDate(subscriptionDetails.getEndDate());

        return subscriptionRepository.save(subscription);
    }

    public void cancelSubscription(Long id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found"));
        subscription.setActive(false);
        subscriptionRepository.save(subscription);
    }

    public Subscription getSubscriptionById(Long id) {
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found"));
    }

    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    public List<Subscription> getActiveSubscriptionsByCustomer(Long customerId) {
        return subscriptionRepository.findByCustomerIdAndIsActive(customerId, true);
    }

    public void deleteSubscription(Long id) {
        if (!subscriptionRepository.existsById(id)) {
            throw new EntityNotFoundException("Subscription not found");
        }
        subscriptionRepository.deleteById(id);
    }
}