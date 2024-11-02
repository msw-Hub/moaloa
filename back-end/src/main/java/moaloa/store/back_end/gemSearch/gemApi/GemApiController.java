package moaloa.store.back_end.gemSearch.gemApi;

import lombok.RequiredArgsConstructor;
import moaloa.store.back_end.gemSearch.crawling.CrawlingService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/gemApi")
public class GemApiController {

    private final GemApiService gemApiService;

    @GetMapping("/test")
    public String test() {
        gemApiService.loaAPI();

        return "success";
    }
}
