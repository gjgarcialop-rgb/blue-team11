package BlueTeam11.ChillCrib.booking;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import BlueTeam11.ChillCrib.customer.Customer;
import BlueTeam11.ChillCrib.customer.CustomerService;
import BlueTeam11.ChillCrib.property.Property;
import BlueTeam11.ChillCrib.property.PropertyService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * REST controller for booking management
 * Handles creating, updating, and viewing property bookings
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;
    private final CustomerService customerService;
    private final PropertyService propertyService;

    public BookingController(BookingService bookingService, CustomerService customerService, PropertyService propertyService) {
        this.bookingService = bookingService;
        this.customerService = customerService;
        this.propertyService = propertyService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Booking>> getBookingsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(bookingService.getBookingsByCustomer(customerId));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Booking>> getBookingsByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(bookingService.getBookingsByProperty(propertyId));
    }

    // Create a new booking with validation for customer and property
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> bookingRequest) {
        try {
            // Extract booking details from request
            Long customerId = Long.valueOf(bookingRequest.get("customerId").toString());
            Long propertyId = Long.valueOf(bookingRequest.get("propertyId").toString());
            String checkIn = bookingRequest.get("checkIn").toString();
            String checkOut = bookingRequest.get("checkOut").toString();
            Integer numberOfGuests = Integer.valueOf(bookingRequest.get("numberOfGuests").toString());
            BigDecimal totalPrice = new BigDecimal(bookingRequest.get("totalPrice").toString());
            
            // Validate customer exists
            Customer customer = null;
            try {
                customer = customerService.getCustomerById(customerId);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Customer not found with ID: " + customerId);
            }
            
            // Validate property exists
            Property property = null;
            try {
                property = propertyService.getPropertyById(propertyId);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Property not found with ID: " + propertyId);
            }
            
            if (customer == null) {
                return ResponseEntity.badRequest().body("Customer is null");
            }
            
            if (property == null) {
                return ResponseEntity.badRequest().body("Property is null");
            }
            
            Booking booking = new Booking();
            booking.setCustomer(customer);
            booking.setProperty(property);
            booking.setCheckIn(LocalDate.parse(checkIn).atStartOfDay());
            booking.setCheckOut(LocalDate.parse(checkOut).atStartOfDay());
            booking.setNumberOfGuests(numberOfGuests);
            booking.setTotalPrice(totalPrice);
            booking.setStatus("CONFIRMED");
            booking.setGuestName(customer.getName());
            
            Booking savedBooking = bookingService.createBooking(booking);
            return ResponseEntity.ok(savedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating booking: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @RequestBody Booking bookingDetails) {
        return ResponseEntity.ok(bookingService.updateBooking(id, bookingDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok().build();
    }
}
