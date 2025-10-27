package BlueTeam11.ChillCrib.provider;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderService providerService;

    @PostMapping
    public ResponseEntity<Provider> addProvider(@Valid @RequestBody Provider provider) {
        return ResponseEntity.ok(providerService.createProvider(provider));
    }

    @PutMapping("api/{id}")
    public ResponseEntity<Provider> updateProvider(@PathVariable Long id, @Valid @RequestBody Provider providerDetails) {
        return ResponseEntity.ok(providerService.updateProvider(id, providerDetails));
    }

    @GetMapping("/api/{id}")
    public ResponseEntity<Provider> getProvider(@PathVariable Long id) {
        return ResponseEntity.ok(providerService.getProvidersById(id));
    }

    
}
