package BlueTeam11.ChillCrib.review;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReviewService {
    private final ReviewRepository repo;
    public ReviewService(ReviewRepository repo) { this.repo = repo; }
    public List<Review> findAll() { return repo.findAll(); }
    public Review findById(Long id) { return repo.findById(id).orElse(null); }
    public Review save(Review r) { return repo.save(r); }
    public void delete(Long id) { repo.deleteById(id); }
}
