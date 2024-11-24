package moaloa.store.back_end.craft;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/craft")
@RequiredArgsConstructor
public class CraftController {

    private final CraftService craftService;

    // 생활재료 데이터를 갱신하는 API ( 단, 거래량은 갱신 x ) >>>>>>>> 서버 첫 실행시엔, json 파일 생성되기에 아래 먼저 해야함
    @GetMapping("/loaApi")
    public ResponseEntity<?> getLoaApi() {
        craftService.getLoaApi();
        return ResponseEntity.ok("json 파일 생성 완료");
    }

    // 제작 아이템 거래량을 갱신하는 API >>>>>>>>> 서버 첫 실행시엔, 이거 먼저 해야함
    @GetMapping("/renewTradeCount")
    public ResponseEntity<?> renewTradeCount() {
        craftService.renewTradeCount();
        return ResponseEntity.ok("거래량 갱신 완료");
    }

    @GetMapping("/readDataAll")
    public ResponseEntity<?> getCraftDataAll() {
        String jsonData = craftService.readJsonFromFile(0); // 파일에서 JSON 읽기
        Object data = craftService.parseJsonToObject(jsonData); // JSON을 객체로 변환
        return ResponseEntity.ok(data);
    }

    @GetMapping("/readLifeData")
    public ResponseEntity<?> getCraftLifeData() {
        String jsonData = craftService.readJsonFromFile(1); // 파일에서 JSON 읽기
        Object data = craftService.parseJsonToObject(jsonData); // JSON을 객체로 변환
        return ResponseEntity.ok(data);
    }

    @GetMapping("/readData")
    public ResponseEntity<?> getCraftData(
            @RequestParam("craftItemId") int craftItemId
    ) {
        String jsonData = craftService.readJsonFromFile(0); // 파일에서 JSON 읽기
        // JSON에서 갱신시간과 생활재료시세 데이터만 추출
        Map<String,Object> data = craftService.reParseJsonToObject(jsonData, craftItemId);
        return ResponseEntity.ok(data);
    }

}

