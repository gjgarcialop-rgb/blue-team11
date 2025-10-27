package BlueTeam11.ChillCrib.review;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService service;
    public ReviewController(ReviewService service) { this.service = service; }
    @GetMapping
    public List<Review> all() { return service.findAll(); }
    @GetMapping("/{id}")
    public ResponseEntity<Review> get(@PathVariable Long id) { Review r = service.findById(id); return r==null? ResponseEntity.notFound().build():ResponseEntity.ok(r); }
    @PostMapping
    public Review create(@RequestBody Review r){ return service.save(r); }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
