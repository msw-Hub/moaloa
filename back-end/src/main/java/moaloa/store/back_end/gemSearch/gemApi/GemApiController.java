package moaloa.store.back_end.gemSearch.gemApi;

import lombok.RequiredArgsConstructor;
import moaloa.store.back_end.gemSearch.crawling.CrawlingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/gemApi")
public class GemApiController {

    private final GemApiService gemApiService;

    @GetMapping("/test")
    public ResponseEntity<?> test(
    ) {
        gemApiService.loaAPI();
        return ResponseEntity.status(HttpStatus.OK).body("보석 API 호출에 성공하였습니다");
    }

}
