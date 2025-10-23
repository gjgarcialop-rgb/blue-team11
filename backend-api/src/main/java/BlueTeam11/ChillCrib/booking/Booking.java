package BlueTeam11.ChillCrib.booking;

import jakarta.persistence.*;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long propertyId;
    private Long customerId;
    private String guestName;
    private java.time.LocalDateTime checkIn;
    private java.time.LocalDateTime checkOut;
    private Integer numberOfGuests;
    private java.math.BigDecimal totalPrice;
    private String status;

    public Booking() {}
}
