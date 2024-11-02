package moaloa.store.back_end.crawling;

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

    @PostMapping("/loaAPI")
    public String loaAPI(@RequestBody Map<String, String> requestBody) throws IOException {
        String api = requestBody.get("api");
        String userNickName = requestBody.get("userNickName");
        crawlingService.loaAPI(api,userNickName);
        return "success";
    }
}
