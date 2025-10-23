package BlueTeam11.ChillCrib.property;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
