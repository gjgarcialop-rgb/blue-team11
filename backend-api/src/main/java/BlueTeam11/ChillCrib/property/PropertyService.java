package BlueTeam11.ChillCrib.property;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PropertyService {
    private final PropertyRepository repo;
    public PropertyService(PropertyRepository repo) { this.repo = repo; }
    public List<Property> findAll() { return repo.findAll(); }
    public Property findById(Long id) { return repo.findById(id).orElse(null); }
    public Property save(Property p) { return repo.save(p); }
    public void delete(Long id) { repo.deleteById(id); }
}
