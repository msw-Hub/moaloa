package moaloa.store.back_end.gemSearch.gemData;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    @GetMapping("/saveJson")
    public ResponseEntity<?> aggregateGemData(
    ){
        gemDataService.aggregateAndSaveGemData();
        return ResponseEntity.status(HttpStatus.OK).body("보석 데이터 집계 및 저장에 성공하였습니다");
    }

    @GetMapping("/readData")
    public ResponseEntity<?> getGemData(
    ) {
        String jsonData = gemDataService.readJsonFromFile(); // 파일에서 JSON 읽기
        Object data = gemDataService.parseJsonToObject(jsonData); // JSON을 객체로 변환
        return ResponseEntity.ok(data);
    }

    @GetMapping("/engraveRate")
    public ResponseEntity<?> getEngraveRate(
    ){
        gemDataService.engraveRate();
        return ResponseEntity.ok("각 각인의 비율을 계산하였습니다");
    }
}
