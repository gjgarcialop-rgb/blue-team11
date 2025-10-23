package BlueTeam11.ChillCrib.provider;

public class ProviderStatistics {
    private Long providerId;
    private Long propertyCount;
    private java.math.BigDecimal totalEarnings;
    private Double averageRating;
    private Long bookingsThisMonth;

    public ProviderStatistics() {}

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }
    public Long getPropertyCount() { return propertyCount; }
    public void setPropertyCount(Long propertyCount) { this.propertyCount = propertyCount; }
    public java.math.BigDecimal getTotalEarnings() { return totalEarnings; }
    public void setTotalEarnings(java.math.BigDecimal totalEarnings) { this.totalEarnings = totalEarnings; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Long getBookingsThisMonth() { return bookingsThisMonth; }
    public void setBookingsThisMonth(Long bookingsThisMonth) { this.bookingsThisMonth = bookingsThisMonth; }
}
