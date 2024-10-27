package moaloa.store.back_end.crawling;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/crawling")
public class CrawlingController {

    private final CrawlingService crawlingService;

    @GetMapping("/test")
    public String test() {
        crawlingService.crawlAndClick();
        return "success";
    }

    @GetMapping("/stest")
    public String stest() {
        crawlingService.scrawlAndClick();
        return "success";
    }
}
