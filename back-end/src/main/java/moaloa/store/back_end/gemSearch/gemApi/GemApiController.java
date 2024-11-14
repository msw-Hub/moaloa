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

    @GetMapping("/gemPrice")
    public ResponseEntity<?> getGemPrice(
    ) {
        gemApiService.getGemPrice();
        return ResponseEntity.status(HttpStatus.OK).body("보석 가격 정보를 업데이트하였습니다");
    }

    @GetMapping("/nowGemPrice")
    public ResponseEntity<?> getNowGemPrice(
    ) {
        String jsonData = gemApiService.readJsonFromFile();
        Object data = gemApiService.parseJsonToObject(jsonData);
        return ResponseEntity.ok(data);
    }
}
