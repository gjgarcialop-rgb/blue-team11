package BlueTeam11.ChillCrib.property;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import BlueTeam11.ChillCrib.provider.Provider;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

	Optional<Property> findByProvider(Provider provider);

	boolean existsByPropertyName(String propertyName);

}
