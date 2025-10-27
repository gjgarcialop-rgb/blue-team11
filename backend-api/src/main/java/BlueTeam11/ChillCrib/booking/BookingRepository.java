package BlueTeam11.ChillCrib.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

	List<Booking> findByCustomerId(Long customerId);

	List<Booking> findByPropertyId(Long propertyId);

	@Query("SELECT COUNT(b) FROM Booking b JOIN b.property p WHERE p.id = :propertyId AND b.checkIn >= :monthStart")
	Long countBookingsThisMonthForProperty(@Param("propertyId") Long propertyId,
			@Param("monthStart") LocalDateTime monthStart);

	@Query("SELECT COALESCE(SUM(b.totalPrice),0) FROM Booking b JOIN b.property p WHERE p.providerId = :providerId")
	BigDecimal sumTotalPriceForProvider(@Param("providerId") Long providerId);
}