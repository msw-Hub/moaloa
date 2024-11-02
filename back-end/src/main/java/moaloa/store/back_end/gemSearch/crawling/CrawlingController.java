package moaloa.store.back_end.gemSearch.crawling;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

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
}
