package BlueTeam11.ChillCrib.review;

import jakarta.persistence.*;

@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long propertyId;
    private Long customerId;
    private Integer rating;
    @Column(columnDefinition = "text")
    private String comment;
    private String guestName;

    public Review() {}
}
