package BlueTeam11.ChillCrib.booking;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService service;
    public BookingController(BookingService service) { this.service = service; }
    @GetMapping
    public List<Booking> all() { return service.findAll(); }
    @GetMapping("/{id}")
    public ResponseEntity<Booking> get(@PathVariable Long id) { Booking b = service.findById(id); return b==null? ResponseEntity.notFound().build():ResponseEntity.ok(b); }
    @PostMapping
    public Booking create(@RequestBody Booking b){ return service.save(b); }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
