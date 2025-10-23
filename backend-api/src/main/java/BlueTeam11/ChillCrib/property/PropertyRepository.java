package BlueTeam11.ChillCrib.property;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PropertyRepository extends JpaRepository<Property, Long> {

	@Query("SELECT COUNT(p) FROM Property p WHERE p.providerId = :providerId")
	Long countByProviderId(@Param("providerId") Long providerId);
}
