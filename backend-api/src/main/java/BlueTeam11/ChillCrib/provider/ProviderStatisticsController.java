package BlueTeam11.ChillCrib.provider;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/providers/{id}/statistics")
public class ProviderStatisticsController {
    private final ProviderStatisticsService service;
    public ProviderStatisticsController(ProviderStatisticsService service) { this.service = service; }

    @GetMapping
    public ProviderStatistics get(@PathVariable("id") Long id) { return service.getStats(id); }
}
