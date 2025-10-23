package BlueTeam11.ChillCrib.property;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "properties")
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long propertyId;
    private String title;

    @Column(nullable = false)
    private String description;
    private String location;
    private java.math.BigDecimal pricePerNight;
    private Integer maxGuests;

    
    @Column(columnDefinition = "text")
    private String amenities; // JSON array stored as text
    private Boolean isActive;
    private Integer bookingsThisMonth;
    private Integer currentImageIndex;
    private Long providerId;

    public Property() {}
}
