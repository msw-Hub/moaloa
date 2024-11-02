package moaloa.store.back_end.gemSearch.gemApi;

import lombok.RequiredArgsConstructor;
import moaloa.store.back_end.gemSearch.crawling.CrawlingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/crawling")
public class GemApiController {

    private final CrawlingService crawlingService;

    @GetMapping("/test")
    public String test() {
        crawlingService.crawlAndClick();
        return "success";
    }
}
