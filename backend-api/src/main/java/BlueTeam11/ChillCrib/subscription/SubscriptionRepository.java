package BlueTeam11.ChillCrib.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByCustomerIdAndIsActive(Long customerId, boolean isActive);

    List<Subscription> findByCustomerId(Long customerId);

    List<Subscription> findByIsActive(boolean isActive);
}