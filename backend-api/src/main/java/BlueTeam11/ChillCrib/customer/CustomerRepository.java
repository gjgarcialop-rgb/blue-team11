package BlueTeam11.ChillCrib.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByAddressContaining(String address);

    List<Customer> findByPhoneNumberContaining(String phoneNumber);

    boolean existsByEmail(String email);

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByIdentifier(String identifier);
}