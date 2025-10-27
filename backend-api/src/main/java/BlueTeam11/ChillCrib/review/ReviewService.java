package BlueTeam11.ChillCrib.review;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Review getReviewById(Long id) {
        return reviewRepository.findById(id).orElse(null);
    }

    public Review createReview(Review review) {
        return reviewRepository.save(review);
    }

    public Review updateReview(Long id, Review reviewDetails) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review != null) {
            review.setRating(reviewDetails.getRating());
            review.setComment(reviewDetails.getComment());
            review.setGuestName(reviewDetails.getGuestName());
            review.setProperty(reviewDetails.getProperty());
            review.setCustomer(reviewDetails.getCustomer());
            return reviewRepository.save(review);
        }
        return null;
    }

    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

    public List<Review> getReviewsByPropertyId(Long propertyId) {
        return reviewRepository.findByPropertyId(propertyId);
    }

    public List<Review> getReviewsByCustomerId(Long customerId) {
        return reviewRepository.findByCustomerId(customerId);
    }

    public List<Review> getReviewsByRating(Integer rating) {
        return reviewRepository.findByRating(rating);
    }

    public Double getAverageRatingForProperty(Long propertyId) {
        return reviewRepository.findAverageRatingByPropertyId(propertyId);
    }

    public Long getReviewCountForProperty(Long propertyId) {
        return reviewRepository.countReviewsByPropertyId(propertyId);
    }
}