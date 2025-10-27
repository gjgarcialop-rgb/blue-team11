package BlueTeam11.ChillCrib.provider;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import BlueTeam11.ChillCrib.property.Property;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@Entity
@Table(name = "providers")
public class Provider {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long providerId;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Email
    @NotBlank
    @Column(unique = true, nullable = false)
    private String email;


    @NotBlank
    @Column(nullable = false)
    private String password;


    @NotBlank
    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private java.math.BigDecimal totalEarnings;

    @Column(nullable = false)
    private Double rating;

    @OneToOne(mappedBy = "provider", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("provider")
    private Property property;

    private String phoneNumber;



    public Provider(Long providerId, String identifier, String email, String password, String name, String phoneNumber, String address, java.math.BigDecimal totalEarnings, Double rating) {
        this.providerId = providerId;
        this.email = email;
        this.password = password;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.totalEarnings = totalEarnings;
        this.rating = rating;
    }

    public Provider(String identifier, String email, String password, String name, String phoneNumber, String address, java.math.BigDecimal totalEarnings, Double rating) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.totalEarnings = totalEarnings;
        this.rating = rating;
    }

    public Long getProviderId() {
        return providerId;
    }

    public void setProviderId(Long providerId) {
        this.providerId = providerId    ;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public java.math.BigDecimal getTotalEarnings() {
        return totalEarnings;
    }

    public void setTotalEarnings(java.math.BigDecimal totalEarnings) {
        this.totalEarnings = totalEarnings;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }
}
