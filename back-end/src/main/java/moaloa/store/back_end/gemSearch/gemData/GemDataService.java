package moaloa.store.back_end.gemSearch.gemData;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import moaloa.store.back_end.exception.custom.GemDataException;
import moaloa.store.back_end.gemSearch.gemApi.GemApiEntity;
import moaloa.store.back_end.gemSearch.gemApi.GemApiRepository;
import moaloa.store.back_end.gemSearch.gemData.dto.GemDto;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GemDataService {

    private final GemApiRepository gemApiRepository;
    private final EngraveCountCache engraveCountCache;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${jsonFile.gemData}")
    private  String filePath;

    private final String[] searchJobId = {
            "11", "12", "13", "14", "91","21","22","31","32","33","34","41","42","43","44","51","61","62","63","64","71","72","73","74","81","82"
    };

    //클로아에서 직업별 상위 100명 조사해서 직업각인 비율 계산
    public void engraveRate() throws IOException {
        engraveCountCache.reset1();
        for (String jobId : searchJobId) {
            String reqURL = "https://secapi.korlark.com/lostark/ranking/character?page=1&limit=3&job=" + jobId;
            log.info("Calling API: {}", reqURL);
            URL url = new URL(reqURL);

            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            int responseCode = conn.getResponseCode();
            InputStreamReader streamReader;

            if (responseCode == 200) {
                streamReader = new InputStreamReader(conn.getInputStream());
            } else {
                streamReader = new InputStreamReader(conn.getErrorStream());
            }
            BufferedReader br = new BufferedReader(streamReader);
            String line;
            StringBuilder result = new StringBuilder();

            while ((line = br.readLine()) != null) {
                result.append(line);
            }
            br.close();

            log.info("Response Code: {}", responseCode);
            log.info("Response: {}", result);

            String responseString = result.toString();
            try {
                JSONArray jsonArray = new JSONArray(responseString);

                // 각 항목에서 arkPassiveEffects 배열의 이름을 가져옴
                for (int i = 0; i < jsonArray.length(); i++) {
                    JSONObject item = jsonArray.getJSONObject(i);
                    JSONArray arkPassiveEffects = item.getJSONArray("arkPassiveEffects");

                    for (int j = 0; j < arkPassiveEffects.length(); j++) {
                        JSONObject effect = arkPassiveEffects.getJSONObject(j);
                        String effectName = effect.getString("name");
                        log.info("effectName: {}", effectName);
                        countEngraveRate(jobId, effectName);
                    }
                }
            } catch (JSONException e) {
                log.error("JSON 파싱 오류: {}", e.getMessage());
                throw new GemDataException("직업각인 가중치를 위한 집계 중 오류가 발생했습니다");
            }
        }
        log.info("Engrave Rate: {}", engraveCountCache.getEngraveCountMap());
    }

    private void countEngraveRate(String jobId, String arkPassiveEffects) {
        switch (jobId) {
            case "11" -> {
                if (arkPassiveEffects.equals("중력 갑옷")) {
                    engraveCountCache.updateEngraveCount("분노의망치", 1);
                } else engraveCountCache.updateEngraveCount("중력수련", 1);
            }
            case "12" -> {
                if (arkPassiveEffects.equals("창술 수련")) {
                    engraveCountCache.updateEngraveCount("고독한기사", 1);
                } else engraveCountCache.updateEngraveCount("전투태세", 1);
            }
            case "13" -> {
                if (arkPassiveEffects.equals("광기")) {
                    engraveCountCache.updateEngraveCount("광기", 1);
                } else engraveCountCache.updateEngraveCount("광전사의비기", 1);
            }
            case "14" -> {
                if (arkPassiveEffects.equals("신성한 의무")) {
                    engraveCountCache.updateEngraveCount("심판자", 1);
                } else engraveCountCache.updateEngraveCount("축복의오라", 1);
            }
            case "91" -> {
                if (arkPassiveEffects.equals("지치지 않는 힘")) {
                    engraveCountCache.updateEngraveCount("처단자", 1);
                } else engraveCountCache.updateEngraveCount("포식자", 1);
            }
            case "21" -> {
                if (arkPassiveEffects.equals("오의난무")) {
                    engraveCountCache.updateEngraveCount("오의난무", 1);
                } else engraveCountCache.updateEngraveCount("일격필살", 1);
            }
            case "22" -> {
                if (arkPassiveEffects.equals("권왕파천무")) {
                    engraveCountCache.updateEngraveCount("권왕파천무", 1);
                } else engraveCountCache.updateEngraveCount("수라의길", 1);
            }
            case "31" -> {
                if (arkPassiveEffects.equals("강력한 오의")) {
                    engraveCountCache.updateEngraveCount("오의강화", 1);
                } else engraveCountCache.updateEngraveCount("초심", 1);
            }
            case "32" -> {
                if (arkPassiveEffects.equals("기력 회복")) {
                    engraveCountCache.updateEngraveCount("체술", 1);
                } else engraveCountCache.updateEngraveCount("충격단력", 1);
            }
            case "33" -> {
                if (arkPassiveEffects.equals("역천지체")) {
                    engraveCountCache.updateEngraveCount("역천지체", 1);
                } else engraveCountCache.updateEngraveCount("세맥타통", 1);
            }
            case "34" -> {
                if (arkPassiveEffects.equals("절제")) {
                    engraveCountCache.updateEngraveCount("절제", 1);
                } else engraveCountCache.updateEngraveCount("절정", 1);
            }
            case "41" -> {
                if (arkPassiveEffects.equals("전술 탄환")) {
                    engraveCountCache.updateEngraveCount("강화무기", 1);
                } else engraveCountCache.updateEngraveCount("핸드거너", 1);
            }
            case "42" -> {
                if (arkPassiveEffects.equals("포격 강화")) {
                    engraveCountCache.updateEngraveCount("포격강화", 1);
                } else engraveCountCache.updateEngraveCount("화력강화", 1);
            }
            case "43" -> {
                if (arkPassiveEffects.equals("두 번째 동료")) {
                    engraveCountCache.updateEngraveCount("두번째동료", 1);
                } else engraveCountCache.updateEngraveCount("죽음의습격", 1);
            }
            case "44" -> {
                if (arkPassiveEffects.equals("아르데타인의 기술")) {
                    engraveCountCache.updateEngraveCount("아르데타인의기술", 1);
                } else engraveCountCache.updateEngraveCount("진화의유산", 1);
            }
            case "51" -> {
                if (arkPassiveEffects.equals("사냥의 시간")) {
                    engraveCountCache.updateEngraveCount("사냥의시간", 1);
                } else engraveCountCache.updateEngraveCount("피스메이커", 1);
            }
            case "61" -> {
                if (arkPassiveEffects.equals("구원의 선물")) {
                    engraveCountCache.updateEngraveCount("절실한구원", 1);
                } else engraveCountCache.updateEngraveCount("진실된용맹", 1);
            }
            case "62" -> {
                if (arkPassiveEffects.equals("넘치는 교감")) {
                    engraveCountCache.updateEngraveCount("넘치는교감", 1);
                } else engraveCountCache.updateEngraveCount("상급소환사", 1);
            }
            case "63" -> {
                if (arkPassiveEffects.equals("황제의 칙령")) {
                    engraveCountCache.updateEngraveCount("황제의칙령", 1);
                } else engraveCountCache.updateEngraveCount("황후의은총", 1);
            }
            case "64" -> {
                if (arkPassiveEffects.equals("점화")) {
                    engraveCountCache.updateEngraveCount("점화", 1);
                } else engraveCountCache.updateEngraveCount("환류", 1);
            }
            case "71" -> {
                if (arkPassiveEffects.equals("버스트 강화")) {
                    engraveCountCache.updateEngraveCount("버스트", 1);
                } else engraveCountCache.updateEngraveCount("잔재된기운", 1);
            }
            case "72" -> {
                if (arkPassiveEffects.equals("멈출 수 없는 충동")) {
                    engraveCountCache.updateEngraveCount("멈출수없는충동", 1);
                } else engraveCountCache.updateEngraveCount("완벽한억제", 1);
            }
            case "73" -> {
                if (arkPassiveEffects.equals("피냄새")) {
                    engraveCountCache.updateEngraveCount("갈증", 1);
                } else engraveCountCache.updateEngraveCount("달의소리", 1);
            }
            case "74" -> {
                if (arkPassiveEffects.equals("영혼친화력")) {
                    engraveCountCache.updateEngraveCount("만월의집행자", 1);
                } else engraveCountCache.updateEngraveCount("그믐의경계", 1);
            }
            case "81" -> {
                if (arkPassiveEffects.equals("해의 조화")) {
                    engraveCountCache.updateEngraveCount("만개", 1);
                } else engraveCountCache.updateEngraveCount("회귀", 1);
            }
            case "82" -> {
                if (arkPassiveEffects.equals("이슬비")) {
                    engraveCountCache.updateEngraveCount("이슬비", 1);
                } else engraveCountCache.updateEngraveCount("질풍술사", 1);
            }
            default ->
                log.warn("Unknown jobId: {}", jobId);
        }
    }


    public void aggregateAndSaveGemData() {
        List<GemApiEntity> gems = gemApiRepository.findAll();
        // gems가 비었을 경우 예외 발생
        if (gems.isEmpty()) {
            throw new GemDataException("데이터베이스에 보석 정보가 없어서 집계를 내릴 수 없습니다");
        }
        //getActualUserCountMap()에 임의 값 설정
        //나중에 삭제 되어야함
        // 집계 결과에서 각인 이름과 카운트를 업데이트
        engraveCountCache.updateActualUserCount("오의강화", 41);
        engraveCountCache.updateActualUserCount("갈증", 38);
        engraveCountCache.updateActualUserCount("넘치는교감", 43);
        engraveCountCache.updateActualUserCount("이슬비", 45);
        engraveCountCache.updateActualUserCount("포식자", 43);
        engraveCountCache.updateActualUserCount("일격필살", 40);
        engraveCountCache.updateActualUserCount("절제", 42);
        engraveCountCache.updateActualUserCount("역천지체", 41);
        engraveCountCache.updateActualUserCount("절정", 42);
        engraveCountCache.updateActualUserCount("멈출수없는충동", 26);
        engraveCountCache.updateActualUserCount("심판자", 42);
        engraveCountCache.updateActualUserCount("환류", 36);
        engraveCountCache.updateActualUserCount("전투태세", 38);
        engraveCountCache.updateActualUserCount("사냥의시간", 45);
        engraveCountCache.updateActualUserCount("광기", 42);
        engraveCountCache.updateActualUserCount("회귀", 36);
        engraveCountCache.updateActualUserCount("포격강화", 37);
        engraveCountCache.updateActualUserCount("분노의망치", 41);
        engraveCountCache.updateActualUserCount("상급소환사", 42);
        engraveCountCache.updateActualUserCount("핸드거너", 45);
        engraveCountCache.updateActualUserCount("아르데타인의기술", 41);
        engraveCountCache.updateActualUserCount("완벽한억제", 37);
        engraveCountCache.updateActualUserCount("광전사의비기", 41);
        engraveCountCache.updateActualUserCount("축복의오라", 41);
        engraveCountCache.updateActualUserCount("수라의길", 42);
        engraveCountCache.updateActualUserCount("버스트", 41);
        engraveCountCache.updateActualUserCount("화력강화", 41);
        engraveCountCache.updateActualUserCount("만월의집행자", 44);
        engraveCountCache.updateActualUserCount("만개", 35);
        engraveCountCache.updateActualUserCount("황후의은총", 38);
        engraveCountCache.updateActualUserCount("권왕파천무", 43);
        engraveCountCache.updateActualUserCount("세맥타통", 44);
        engraveCountCache.updateActualUserCount("그믐의경계", 45);
        engraveCountCache.updateActualUserCount("황제의칙령", 43);
        engraveCountCache.updateActualUserCount("달의소리", 48);
        engraveCountCache.updateActualUserCount("처단자", 45);
        engraveCountCache.updateActualUserCount("오의난무", 41);
        engraveCountCache.updateActualUserCount("점화", 37);
        engraveCountCache.updateActualUserCount("고독한기사", 37);
        engraveCountCache.updateActualUserCount("잔재된기운", 45);
        engraveCountCache.updateActualUserCount("진화의유산", 26);
        engraveCountCache.updateActualUserCount("강화무기", 42);
        engraveCountCache.updateActualUserCount("중력수련", 37);
        engraveCountCache.updateActualUserCount("체술", 39);
        engraveCountCache.updateActualUserCount("피스메이커", 41);
        engraveCountCache.updateActualUserCount("충격단련", 41);
        engraveCountCache.updateActualUserCount("죽음의습격", 40);
        engraveCountCache.updateActualUserCount("초심", 43);
        engraveCountCache.updateActualUserCount("두번째동료", 37);
        engraveCountCache.updateActualUserCount("진실된용맹", 37);
        engraveCountCache.updateActualUserCount("질풍술사", 40);
        engraveCountCache.updateActualUserCount("절실한구원", 37);



        // 데이터 집계 및 채용률 계산
        Map<String, Map<String, Map<String, Double>>> aggregatedData = gems.stream()
                .collect(Collectors.groupingBy(
                        GemApiEntity::getCharacterClassName,
                        Collectors.groupingBy(
                                GemApiEntity::getGemType,
                                Collectors.groupingBy(
                                        GemApiEntity::getSkillName,
                                        Collectors.collectingAndThen(
                                                Collectors.summingDouble(
                                                        // 각 직업 각인에 대해 ( 해당 스킬 사용자 수 / 조사 대상자 수 ) 로 채용률을 계산
                                                        gem -> (double) gem.getCount() / engraveCountCache.getActualUserCountMap().getOrDefault(gem.getEngraveType(), 0)
                                                                * engraveCountCache.getEngraveCountMap().getOrDefault(gem.getEngraveType(), 0)),
                                                sum -> {
                                                    // 둘을 더함
                                                    return BigDecimal.valueOf(sum)
                                                            .setScale(3, RoundingMode.HALF_UP)
                                                            .doubleValue(); // 소수점 셋째 자리에서 반올림
                                                }
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
                        .filter(entry -> entry.getValue() >= 5) // 채용률 >= 5% 필터링
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
