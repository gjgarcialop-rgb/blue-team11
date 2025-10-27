package BlueTeam11.ChillCrib.property;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {
    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @PostMapping
    public ResponseEntity<Property> createProperty(@RequestBody Property property) {
        return ResponseEntity.ok(propertyService.createProperty(property));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Property> updateProperty(@PathVariable Long id, @RequestBody Property propertyDetails) {
        return ResponseEntity.ok(propertyService.updateProperty(id, propertyDetails));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> getProperty(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    @GetMapping
    public ResponseEntity<List<Property>> getAllProperties() {
        return ResponseEntity.ok(propertyService.getAllProperties());
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<Property>> getPropertiesByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(propertyService.getPropertiesByProviderId(providerId));
    }

    @GetMapping("/location/{location}")
    public ResponseEntity<List<Property>> getPropertiesByLocation(@PathVariable String location) {
        return ResponseEntity.ok(propertyService.getPropertiesByLocation(location));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.noContent().build();
    }
}
