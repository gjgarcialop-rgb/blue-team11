package BlueTeam11.ChillCrib.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    List<Review> findByPropertyId(Long propertyId);
    
    List<Review> findByCustomerId(Long customerId);
    
    List<Review> findByRating(Integer rating);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.property.id = :propertyId")
    Double findAverageRatingByPropertyId(@Param("propertyId") Long propertyId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.property.id = :propertyId")
    Long countReviewsByPropertyId(@Param("propertyId") Long propertyId);
}