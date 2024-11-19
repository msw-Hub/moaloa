package moaloa.store.back_end.craft;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api/v1/craft")
@RequiredArgsConstructor
public class CraftController {

    private final CraftService craftService;

    @GetMapping("/loaApi")
    public ResponseEntity<?> getLoaApi() {
        craftService.getLoaApi();
        return ResponseEntity.ok("json 파일 생성 완료");
    }

    @GetMapping("/readDataAll")
    public ResponseEntity<?> getCraftData() {
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
}

