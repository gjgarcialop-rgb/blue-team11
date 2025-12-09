package BlueTeam11.ChillCrib.review;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for property reviews
 * Handles creating, updating, and retrieving reviews with provider replies
 */
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        return ResponseEntity.ok(reviewService.createReview(review));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(@PathVariable Long id, @RequestBody Review reviewDetails) {
        Review updatedReview = reviewService.updateReview(id, reviewDetails);
        return updatedReview != null ? ResponseEntity.ok(updatedReview) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReview(@PathVariable Long id) {
        Review review = reviewService.getReviewById(id);
        return review != null ? ResponseEntity.ok(review) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Review>> getReviewsByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(reviewService.getReviewsByPropertyId(propertyId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Review>> getReviewsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(reviewService.getReviewsByCustomerId(customerId));
    }

    @GetMapping("/rating/{rating}")
    public ResponseEntity<List<Review>> getReviewsByRating(@PathVariable Integer rating) {
        return ResponseEntity.ok(reviewService.getReviewsByRating(rating));
    }

    @GetMapping("/property/{propertyId}/average-rating")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long propertyId) {
        Double averageRating = reviewService.getAverageRatingForProperty(propertyId);
        return averageRating != null ? ResponseEntity.ok(averageRating) : ResponseEntity.ok(0.0);
    }

    @GetMapping("/property/{propertyId}/count")
    public ResponseEntity<Long> getReviewCount(@PathVariable Long propertyId) {
        return ResponseEntity.ok(reviewService.getReviewCountForProperty(propertyId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}