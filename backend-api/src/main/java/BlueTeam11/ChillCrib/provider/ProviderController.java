package BlueTeam11.ChillCrib.provider;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/providers")
public class ProviderController {
    private final ProviderService service;
    public ProviderController(ProviderService service) { this.service = service; }
    @GetMapping
    public List<Provider> all() { return service.findAll(); }
    @GetMapping("/{id}")
    public ResponseEntity<Provider> get(@PathVariable Long id) { Provider p = service.findById(id); return p==null? ResponseEntity.notFound().build():ResponseEntity.ok(p); }
    @PostMapping
    public Provider create(@RequestBody Provider p){ return service.save(p); }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
