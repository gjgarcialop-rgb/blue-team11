package BlueTeam11.ChillCrib.provider;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class ProviderService {
    private final ProviderRepository providerRepository;

    public ProviderService(ProviderRepository providerRepository) {
        this.providerRepository = providerRepository;
    }

    public Provider createProvider(Provider provider) {
        if (providerRepository.existsByEmail(provider.getEmail())) {
            throw new IllegalStateException("Provider with the same email already exists.");
        }
        return providerRepository.save(provider);
    }

    public Provider updateProvider(Long id, Provider providerDetails) {
        Provider provider = providerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Provider not found"));

        if (!provider.getEmail().equals(providerDetails.getEmail()) &&
                providerRepository.existsByEmail(providerDetails.getEmail())) {
            throw new IllegalStateException("Email is already in use.");
        }

        provider.setIdentifier(providerDetails.getIdentifier());
        provider.setName(providerDetails.getName());
        provider.setEmail(providerDetails.getEmail());
        provider.setPhoneNumber(providerDetails.getPhoneNumber());
        provider.setAddress(providerDetails.getAddress());
        provider.setTotalEarnings(providerDetails.getTotalEarnings());
        provider.setRating(providerDetails.getRating());

        return providerRepository.save(provider);
    }

    public Provider getProviderById(Long id) {
        return providerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Provider not found"));
    }

    public List<Provider> getAllProviders() {
        return providerRepository.findAll();
    }

    public Provider findByEmail(String email) {
        return providerRepository.findByEmail(email).orElse(null);
    }

    public void deleteProvider(Long id) {
        if (!providerRepository.existsById(id)) {
            throw new EntityNotFoundException("Provider not found");
        }
        providerRepository.deleteById(id);
    }
}
