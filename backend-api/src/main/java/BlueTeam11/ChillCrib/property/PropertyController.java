package BlueTeam11.ChillCrib.property;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {
    private final PropertyService service;
    public PropertyController(PropertyService service) { this.service = service; }
    @GetMapping
    public List<Property> all() { return service.findAll(); }
    @GetMapping("/{id}")
    public ResponseEntity<Property> get(@PathVariable Long id) { Property p = service.findById(id); return p==null? ResponseEntity.notFound().build():ResponseEntity.ok(p); }
    @PostMapping
    public Property create(@RequestBody Property p){ return service.save(p); }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
