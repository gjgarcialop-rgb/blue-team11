package BlueTeam11.ChillCrib.provider;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import BlueTeam11.ChillCrib.property.PropertyRepository;
import BlueTeam11.ChillCrib.booking.BookingRepository;

@Service
public class ProviderStatisticsService {
    private final PropertyRepository propertyRepo;
    private final BookingRepository bookingRepo;
    private final ProviderRepository providerRepo;

    public ProviderStatisticsService(PropertyRepository propertyRepo, BookingRepository bookingRepo, ProviderRepository providerRepo) {
        this.propertyRepo = propertyRepo;
        this.bookingRepo = bookingRepo;
        this.providerRepo = providerRepo;
    }

    public ProviderStatistics getStats(Long providerId) {
        ProviderStatistics s = new ProviderStatistics();
        s.setProviderId(providerId);
        s.setPropertyCount(propertyRepo.countByProviderId(providerId));
        s.setTotalEarnings(bookingRepo.sumTotalPriceForProvider(providerId));
        // average rating could be computed from properties or provider.rating; keep simple
        Provider p = providerRepo.findById(providerId).orElse(null);
        s.setAverageRating(p==null?0.0:p.getRating());
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).toLocalDate().atStartOfDay();
        s.setBookingsThisMonth(bookingRepo.countBookingsThisMonthForProvider(providerId, monthStart));
        return s;
    }
}
