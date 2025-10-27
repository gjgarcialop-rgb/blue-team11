package BlueTeam11.ChillCrib.property;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PropertyService {
    private final PropertyRepository chillCribRepository;
    
    public Property createProperty(Property property) {
        if (chillCribRepository.existsByPropertyName(property.getChillCrib())) {
            throw new IllegalStateException("Property with the same name already exists.");
        }
        return chillCribRepository.save(property);
    }

    public Property getPropertyById(Long id) {
        return chillCribRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("The Crib you requested was not found"));
    }

    public Property updateProperty(Long id, Property cribDetails) {
        Property existingProperty = chillCribRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("The Crib you requested was not found"));

        if (!existingProperty.getChillCrib().equals(cribDetails.getChillCrib()) &&
            chillCribRepository.existsByPropertyName(cribDetails.getChillCrib())) {
            throw new IllegalStateException("A Crib with the same name already exists.");
        }

        existingProperty.setChillCrib(cribDetails.getChillCrib());
        existingProperty.setDescription(cribDetails.getDescription());
        existingProperty.setLocation(cribDetails.getLocation());
        existingProperty.setPricePerNight(cribDetails.getPricePerNight());
        existingProperty.setMaxGuests(cribDetails.getMaxGuests());

        return chillCribRepository.save(existingProperty);
    }

    public void deleteProperty(Long id) {
        if (!chillCribRepository.existsById(id)) {
            throw new EntityNotFoundException("The Crib you requested was not found");
        }
        chillCribRepository.deleteById(id);
    }

    public List<Property> getAllProperties() {
        return chillCribRepository.findAll();
    }

    
}
