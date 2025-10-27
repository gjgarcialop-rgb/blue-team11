package BlueTeam11.ChillCrib.provider;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {

    Optional<Provider> findByEmail(String email);
    boolean existsByEmail(String email);

}
