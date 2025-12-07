package BlueTeam11.ChillCrib.property;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import BlueTeam11.ChillCrib.provider.Provider;
import BlueTeam11.ChillCrib.provider.ProviderService;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {
    private final PropertyService propertyService;
    private final ProviderService providerService;

    public PropertyController(PropertyService propertyService, ProviderService providerService) {
        this.propertyService = propertyService;
        this.providerService = providerService;
    }

    @PostMapping
    public ResponseEntity<?> createProperty(@RequestBody PropertyRequest req) {
    if (req.providerId == null) return ResponseEntity.badRequest().body("Provider is required");
    if (req.title == null || req.title.isBlank()) return ResponseEntity.badRequest().body("Title is required");
    if (req.location == null || req.location.isBlank()) return ResponseEntity.badRequest().body("Location is required");

    Provider provider = providerService.getProviderById(req.providerId);
    if (provider == null) return ResponseEntity.badRequest().body("Provider not found: " + req.providerId);

    Property p = new Property();
    p.setTitle(req.title);
    p.setLocation(req.location);
    p.setDescription(req.description);
    p.setPricePerNight(req.pricePerNight != null ? req.pricePerNight : BigDecimal.ZERO);
    p.setAmenities(req.amenities);
    p.setMaxGuests(req.maxGuests);
    p.setIsActive(req.isActive != null ? req.isActive : true);
    p.setBookingsThisMonth(0);
    p.setProvider(provider);

    Property saved = propertyService.createProperty(p);
    return ResponseEntity.ok(saved);
    }









    // public ResponseEntity<?> createProperty(@RequestBody Property property) {
    //     //This PostMapping if statement makes sure that there is a valid provider with the property;
    //     //or else, it will return a bad request response.
    //     if(property.getProvider() == null || property.getProvider().getId() == null ) {
    //     return ResponseEntity.badRequest().body("Provider is required");
    //     }

    //     try{
    //         Long providerId = property.getProvider().getId();
    //         System.out.println("looking for provider: " + providerId);

    //     Provider provider = providerService.getProviderById(providerId);
    //         System.out.println("Provider found: " + provider);

    //     property.setProvider(provider);
    //     Property saved = propertyService.createProperty(property);

    //     System.out.println("Property saved with id: " + saved.getId());
    //     return ResponseEntity.ok(saved);
    //     } catch (Exception e) {
    //         System.err.println("Error: " + e.getMessage());
    //         e.printStackTrace();
    //         return ResponseEntity.badRequest().body("Error:" + e.getMessage());
    //     }

    // }

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
