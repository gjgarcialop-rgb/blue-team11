package BlueTeam11.ChillCrib.provider;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProviderService {

private final ProviderRepository providerRepository;

    public Provider createProvider(Provider provider) {
        if(providerRepository.existsByEmail(provider.getEmail())) {
          throw new IllegalStateException("Provider with the same email already exists.");
        }
        return providerRepository.save(provider);
    }

    public Provider updateProvider(Long id, Provider providerDetails) {

        Provider provider = providerRepository.findById(id)
          .orElseThrow(() -> new EntityNotFoundException("Provider not found"));

        provider.setName(providerDetails.getName());
          if(!provider.getEmail().equals(providerDetails.getEmail()) &&
          providerRepository.existsByEmail(providerDetails.getEmail())) {
            throw new IllegalStateException("Email is already in use.");
          }
        provider.setEmail(providerDetails.getEmail());
        provider.setName(providerDetails.getName());
        provider.setPhoneNumber(providerDetails.getPhoneNumber());
        provider.setAddress(providerDetails.getAddress());
        provider.setTotalEarnings(providerDetails.getTotalEarnings());
        provider.setRating(providerDetails.getRating());

        return providerRepository.save(provider);
    }

    public Provider getProvidersById(Long id) {
        return providerRepository.findById(id)
          .orElseThrow(() -> new EntityNotFoundException("Provider not found"));
    }

    public Provider getProvidersByEmail(String email) {
        return providerRepository.findByEmail(email)
          .orElseThrow(() -> new EntityNotFoundException("Provider not found"));
    }

}
