package BlueTeam11.ChillCrib.subscription;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {
    private final SubscriptionService service;
    public SubscriptionController(SubscriptionService service) { this.service = service; }
    @GetMapping
    public List<Subscription> all() { return service.findAll(); }
    @GetMapping("/{id}")
    public ResponseEntity<Subscription> get(@PathVariable Long id) { Subscription s = service.findById(id); return s==null? ResponseEntity.notFound().build():ResponseEntity.ok(s); }
    @PostMapping
    public Subscription create(@RequestBody Subscription s){ return service.save(s); }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
