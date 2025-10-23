package BlueTeam11.ChillCrib.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface BookingRepository extends JpaRepository<Booking, Long> {

	@Query("SELECT COUNT(b) FROM Booking b JOIN Property p ON p.id = b.propertyId WHERE p.providerId = :providerId AND b.checkIn >= :monthStart")
	Long countBookingsThisMonthForProvider(@Param("providerId") Long providerId, @Param("monthStart") LocalDateTime monthStart);

	@Query("SELECT COALESCE(SUM(b.totalPrice),0) FROM Booking b JOIN Property p ON p.id = b.propertyId WHERE p.providerId = :providerId")
	java.math.BigDecimal sumTotalPriceForProvider(@Param("providerId") Long providerId);
}
