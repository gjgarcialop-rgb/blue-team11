package BlueTeam11.ChillCrib.booking;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookingService {
    private final BookingRepository repo;
    public BookingService(BookingRepository repo) { this.repo = repo; }
    public List<Booking> findAll() { return repo.findAll(); }
    public Booking findById(Long id) { return repo.findById(id).orElse(null); }
    public Booking save(Booking b) { return repo.save(b); }
    public void delete(Long id) { repo.deleteById(id); }
}
