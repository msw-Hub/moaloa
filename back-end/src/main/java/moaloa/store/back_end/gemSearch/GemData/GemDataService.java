package moaloa.store.back_end.gemSearch.GemData;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import moaloa.store.back_end.gemSearch.GemData.dto.GemClassDto;
import moaloa.store.back_end.gemSearch.GemData.dto.GemDto;
import moaloa.store.back_end.gemSearch.gemApi.GemApiEntity;
import moaloa.store.back_end.gemSearch.gemApi.GemApiRepository;
import org.springframework.stereotype.Service;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GemDataService {

    private final GemApiRepository gemApiRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void aggregateAndSaveGemData() throws IOException {
        List<GemApiEntity> gems = gemApiRepository.findAll();

        // 데이터 집계
        Map<String, Map<String, Map<String, Integer>>> aggregatedData = gems.stream()
                .collect(Collectors.groupingBy(
                        GemApiEntity::getCharacterClassName,
                        Collectors.groupingBy(
                                GemApiEntity::getGemType,
                                Collectors.groupingBy(
                                        GemApiEntity::getSkillName,
                                        Collectors.summingInt(GemApiEntity::getCount) // 카운트 합산
                                )
                        )
                ));

        // 필터링 및 정렬
        Map<String, Map<String, List<GemDto>>> filteredAndSortedData = new LinkedHashMap<>();

        aggregatedData.forEach((className, gemTypeMap) -> {
            Map<String, List<GemDto>> filteredGemTypes = new LinkedHashMap<>();

            gemTypeMap.forEach((gemType, skillCountMap) -> {
                List<GemDto> filteredAndSortedGems = skillCountMap.entrySet().stream()
                        .filter(entry -> entry.getValue() >= 3)  // count >= 3 필터링
                        .map(entry -> new GemDto(entry.getKey(), entry.getValue()))  // GemDto 생성
                        .sorted((a, b) -> Integer.compare(b.getCount(), a.getCount()))  // count 기준 내림차순
                        .collect(Collectors.toList());

                if (!filteredAndSortedGems.isEmpty()) {
                    filteredGemTypes.put(gemType, filteredAndSortedGems);
                }
            });

            if (!filteredGemTypes.isEmpty()) {
                filteredAndSortedData.put(className, filteredGemTypes);
            }
        });

        // JSON으로 변환
        String jsonResult = objectMapper.writeValueAsString(filteredAndSortedData);

        // JSON 데이터를 파일에 저장 (덮어쓰기)
        saveJsonToFile(jsonResult);
    }


    private void saveJsonToFile(String jsonData) throws IOException {
        String filePath = "back-end/src/main/resources/gemData.json"; // 파일 경로
        Files.write(Paths.get(filePath), jsonData.getBytes());
    }

    public String readJsonFromFile() throws IOException {
        String filePath = "back-end/src/main/resources/gemData.json"; // 파일 경로
        return new String(Files.readAllBytes(Paths.get(filePath))); // 파일의 모든 바이트를 읽어 문자열로 변환
    }

    public Object parseJsonToObject(String jsonData) throws JsonProcessingException {
        return objectMapper.readValue(jsonData, Object.class);
    }
}
