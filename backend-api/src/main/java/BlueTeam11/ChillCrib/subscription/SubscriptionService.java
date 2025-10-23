package BlueTeam11.ChillCrib.subscription;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SubscriptionService {
    private final SubscriptionRepository repo;
    public SubscriptionService(SubscriptionRepository repo) { this.repo = repo; }
    public List<Subscription> findAll() { return repo.findAll(); }
    public Subscription findById(Long id) { return repo.findById(id).orElse(null); }
    public Subscription save(Subscription s) { return repo.save(s); }
    public void delete(Long id) { repo.deleteById(id); }
}
