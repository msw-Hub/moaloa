package moaloa.store.back_end.gemSearch.gemData;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import moaloa.store.back_end.exception.custom.GemDataException;
import moaloa.store.back_end.gemSearch.gemData.dto.GemDto;
import moaloa.store.back_end.gemSearch.gemApi.GemApiEntity;
import moaloa.store.back_end.gemSearch.gemApi.GemApiRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GemDataService {

    private final GemApiRepository gemApiRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final double userCount = 40;   //클래스 직업별 max 채용인원
    private final String filePath = "back-end/src/main/resources/gemData.json";

    public void aggregateAndSaveGemData() {
        List<GemApiEntity> gems = gemApiRepository.findAll();
        // gems가 비었을 경우 예외 발생
        if (gems.isEmpty()) {
            throw new GemDataException("데이터베이스에 보석 정보가 없어서 집계를 내릴 수 없습니다");
        }

        // 데이터 집계 및 채용률 계산
        Map<String, Map<String, Map<String, Double>>> aggregatedData = gems.stream()
                .collect(Collectors.groupingBy(
                        GemApiEntity::getCharacterClassName,
                        Collectors.groupingBy(
                                GemApiEntity::getGemType,
                                Collectors.groupingBy(
                                        GemApiEntity::getSkillName,
                                        Collectors.collectingAndThen(
                                                Collectors.summingInt(GemApiEntity::getCount),
                                                sum -> BigDecimal.valueOf(sum / userCount * 100)
                                                        .setScale(3, RoundingMode.HALF_UP)
                                                        .doubleValue() // 소수점 셋째 자리에서 반올림
                                        )
                                )
                        )
                ));

        // 필터링 및 정렬
        Map<String, Map<String, List<GemDto>>> filteredAndSortedData = new LinkedHashMap<>();

        aggregatedData.forEach((className, gemTypeMap) -> {
            Map<String, List<GemDto>> filteredGemTypes = new LinkedHashMap<>();

            gemTypeMap.forEach((gemType, skillMap) -> {
                List<GemDto> filteredAndSortedGems = skillMap.entrySet().stream()
                        .filter(entry -> entry.getValue() >= 10) // 채용률 >= 10% 필터링
                        .sorted((a, b) -> Double.compare(b.getValue(), a.getValue())) // 채용률 기준 내림차순
                        .map(entry -> new GemDto(entry.getKey(), entry.getValue())) // GemDto 생성
                        .collect(Collectors.toList());

                if (!filteredAndSortedGems.isEmpty()) {
                    filteredGemTypes.put(gemType, filteredAndSortedGems);
                }
            });

            if (!filteredGemTypes.isEmpty()) {
                filteredAndSortedData.put(className, filteredGemTypes);
            }
        });

        try {
            // JSON으로 변환
            String jsonResult = objectMapper.writeValueAsString(filteredAndSortedData);
            // JSON 데이터를 파일에 저장 (덮어쓰기)
            saveJsonToFile(jsonResult);
        } catch (JsonProcessingException e) {
            throw new GemDataException("JSON 파일로 변환 중 오류가 발생했습니다");
        }
    }


    private void saveJsonToFile(String jsonData){
        try {
            Files.write(Paths.get(filePath), jsonData.getBytes());
        } catch (IOException e) {
            throw new GemDataException("JSON 파일 저장 중 오류가 발생했습니다");
        }
    }

    public String readJsonFromFile() {
        try {
            return Files.readString(Paths.get(filePath));
        } catch (IOException e) {
            throw new GemDataException("JSON 파일 읽기 중 오류가 발생했습니다");
        }
    }

    public Object parseJsonToObject(String jsonData){
        try {
            return objectMapper.readValue(jsonData, Object.class);
        } catch (JsonProcessingException e) {
            throw new GemDataException("JSON 데이터를 객체로 변환 중 오류가 발생했습니다");
        }
    }
}
