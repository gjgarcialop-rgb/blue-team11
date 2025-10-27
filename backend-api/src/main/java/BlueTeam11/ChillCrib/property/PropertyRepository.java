package BlueTeam11.ChillCrib.property;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import BlueTeam11.ChillCrib.provider.Provider;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    Optional<Property> findByProvider(Provider provider);
    
    List<Property> findByProviderId(Long providerId);
    
    List<Property> findByLocationContainingIgnoreCase(String location);
    
    List<Property> findByTitleContainingIgnoreCase(String title);
    
    List<Property> findByIsActiveTrue();
}
