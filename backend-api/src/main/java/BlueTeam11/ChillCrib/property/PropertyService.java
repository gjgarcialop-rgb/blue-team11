package BlueTeam11.ChillCrib.property;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class PropertyService {
    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    public Property createProperty(Property property) {
        return propertyRepository.save(property);
    }

    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Property not found"));
    }

    public Property updateProperty(Long id, Property propertyDetails) {
        Property existingProperty = propertyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Property not found"));

        existingProperty.setTitle(propertyDetails.getTitle());
        existingProperty.setDescription(propertyDetails.getDescription());
        existingProperty.setLocation(propertyDetails.getLocation());
        existingProperty.setPricePerNight(propertyDetails.getPricePerNight());
        existingProperty.setMaxGuests(propertyDetails.getMaxGuests());
        existingProperty.setAmenities(propertyDetails.getAmenities());
        existingProperty.setIsActive(propertyDetails.getIsActive());

        return propertyRepository.save(existingProperty);
    }

    public void deleteProperty(Long id) {
        if (!propertyRepository.existsById(id)) {
            throw new EntityNotFoundException("Property not found");
        }
        propertyRepository.deleteById(id);
    }

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    public List<Property> getPropertiesByProviderId(Long providerId) {
        return propertyRepository.findByProviderId(providerId);
    }

    public List<Property> getPropertiesByLocation(String location) {
        return propertyRepository.findByLocationContainingIgnoreCase(location);
    }
}
