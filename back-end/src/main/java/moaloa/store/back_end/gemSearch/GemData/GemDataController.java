package moaloa.store.back_end.gemSearch.GemData;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/gemData")
public class GemDataController {

    private final GemDataService gemDataService;

    @GetMapping("/test")
    public String aggregateGemData() throws IOException {
        gemDataService.aggregateAndSaveGemData();
        return "Gem data aggregated and saved successfully!";
    }

    @GetMapping("/data")
    public ResponseEntity<Object> getGemData() {
        try {
            String jsonData = gemDataService.readJsonFromFile(); // 파일에서 JSON 읽기
            Object data = gemDataService.parseJsonToObject(jsonData); // JSON을 객체로 변환
            return ResponseEntity.ok(data); // JSON 데이터를 응답으로 반환
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error reading gem data file.");
        }
    }
}
