package BlueTeam11.ChillCrib.property;


import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import BlueTeam11.ChillCrib.provider.Provider;
import BlueTeam11.ChillCrib.review.Review;
import BlueTeam11.ChillCrib.subscription.Subscription;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "properties")
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long propertyId;


    @OneToOne@JoinColumn(name = "provider_id", nullable = false)
    @JsonIgnoreProperties("property")
    private Provider provider;

    @NotBlank
    @Column(nullable = false) 
    private String chillCrib;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank
    private String location;
    
    @NotNull
    @Positive
    private BigDecimal pricePerNight;

    @NotNull
    @Positive
    private Integer maxGuests;

    @NotNull
    private boolean available = true;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("property")
    private List<Subscription> subscriptions = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("property")
    private List<Review> reviews = new ArrayList<>();












}
