package BlueTeam11.ChillCrib.subscription;

import jakarta.persistence.*;

@Entity
@Table(name = "subscriptions")
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long customerId;
    private String type;
    private Boolean isActive;
    private java.time.LocalDateTime startDate;
    private java.time.LocalDateTime endDate;

    public Subscription() {}
}
