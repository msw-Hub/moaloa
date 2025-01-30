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

//    @GetMapping("/test")
//    public ResponseEntity<?> test(
//    ) {
//        crawlingService.crawlAndClick();
//        return ResponseEntity.status(HttpStatus.OK).body("크롤링에 성공하였습니다");
//    }

    @GetMapping("/findId")
    public ResponseEntity<?> findId() {
        try {
            crawlingService.findId();
            return ResponseEntity.ok("아이디 찾기에 성공하였습니다");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("크롤링 실패: " + e.getMessage());
        }
    }
}
