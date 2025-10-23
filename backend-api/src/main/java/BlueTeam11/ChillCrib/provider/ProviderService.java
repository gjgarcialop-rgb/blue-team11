package BlueTeam11.ChillCrib.provider;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProviderService {
    private final ProviderRepository repo;
    public ProviderService(ProviderRepository repo) { this.repo = repo; }
    public List<Provider> findAll() { return repo.findAll(); }
    public Provider findById(Long id) { return repo.findById(id).orElse(null); }
    public Provider save(Provider p) { return repo.save(p); }
    public void delete(Long id) { repo.deleteById(id); }
}
