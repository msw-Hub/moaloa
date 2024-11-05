package moaloa.store.back_end.gemSearch.crawling;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/crawling")
public class CrawlingController {

    private final CrawlingService crawlingService;

    @GetMapping("/test")
    public ResponseEntity<?> test(
    ) {
        crawlingService.crawlAndClick();
        return ResponseEntity.status(HttpStatus.OK).body("크롤링에 성공하였습니다");
    }

}
