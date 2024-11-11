package moaloa.store.back_end.craft;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import moaloa.store.back_end.exception.custom.CraftApiGetException;
import moaloa.store.back_end.exception.custom.CraftDataException;
import moaloa.store.back_end.exception.custom.GemDataException;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class CraftService {

    private final String[] craftApi;
    private final CraftRepository craftRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
   /*
        "Subs" 항목 코드들
            90200: 식물채집 전리품
            90300: 벌목 전리품
            90400: 채광 전리품
            90500: 수렵 전리품
            90600: 낚시 전리품
            90700: 고고학 전리품
            50010: 융화 재료
            70000: 요리
            60200: 회복형 배틀 아이템
            60300: 공격형 배틀 아이템
            60400: 기능형 배틀 아이템
            60500: 버프형 배틀 아이템
     */
    private Map<Integer, List<String>> subsCodeMap() {
        Map<Integer, List<String>> map = new HashMap<>();

        map.put(90200, List.of("null"));
        map.put(90300, List.of("null"));
        map.put(90400, List.of("null"));
        map.put(90500, List.of("null"));
        map.put(90600, List.of("null"));
        map.put(90700, List.of("null"));
        map.put(50010, List.of("융화 재료"));
        map.put(70000, List.of("거장의 채끝 스테이크 정식", "대가의 안심 스테이크 정식", "명인의 허브 스테이크 정식", "거장의 특제 스튜", "명인의 쫄깃한 꼬치구이"));
        map.put(60200, List.of("null"));
        map.put(60300, List.of("점토","화염","암흑","회오리","폭탄"));
        map.put(60400, List.of("신호탄","만능","페로몬","시간","성스러운","불꽃 마법"));
        map.put(60500, List.of("신속 로브", "진군", "각성","아드로핀"));
        return map;
    }

    @Transactional
    public void getLoaApi() {
        String reqURL = "https://developer-lostark.game.onstove.com/markets/items";
        Map<Integer, List<String>> codeToItemsMap = subsCodeMap();
        try {
            for (Map.Entry<Integer, List<String>> entry : codeToItemsMap.entrySet()) {
                int code = entry.getKey();
                List<String> itemNames = entry.getValue();

                for (String itemName : itemNames) {
                    HttpURLConnection conn = (HttpURLConnection) new URL(reqURL).openConnection();
                    conn.setRequestMethod("POST");
                    conn.setRequestProperty("Authorization", "bearer " + craftApi[0]);
                    conn.setRequestProperty("Accept", "application/json");
                    conn.setRequestProperty("Content-Type", "application/json");
                    conn.setDoOutput(true);

                    String jsonInputString = createJsonInputString(code, itemName);

                    // JSON 데이터 전송
                    try (OutputStream os = conn.getOutputStream()) {
                        byte[] input = jsonInputString.getBytes("utf-8");
                        os.write(input, 0, input.length);
                    }

                    int responseCode = conn.getResponseCode();
                    InputStreamReader streamReader = (responseCode == 200) ?
                            new InputStreamReader(conn.getInputStream()) : new InputStreamReader(conn.getErrorStream());

                    BufferedReader br = new BufferedReader(streamReader);
                    StringBuilder result = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        result.append(line);
                    }
                    br.close();

                    // 데이터 저장
                    saveItemsOneByOne(result, code);
                    // 연결을 명시적으로 닫음
                    conn.disconnect();
                }
            }
            List<CraftEntity> craftEntities = craftRepository.findAll();
            if(craftEntities.isEmpty()) {
                log.error("CraftEntity가 비어있습니다.");
                throw new CraftDataException("영지 제작 엔티티가 비어있습니다");
            }
            // JSON으로 변환 저장
            String jsonResult = objectMapper.writeValueAsString(craftEntities);
            saveJsonToFile(jsonResult);
        } catch (Exception e) {
            log.error("Craft API 호출 중 오류가 발생했습니다");
            throw new CraftApiGetException("로스트아크 API 호출 중 오류가 발생했습니다.");
        }
    }


    // 로아 api 요청해서 받은 아이템 시세 데이터를 하나씩 저장
    @Transactional
    protected void saveItemsOneByOne(StringBuilder result, int code) {
        String responseString = result.toString();

        // JSON 응답 파싱
        JSONObject responseJson = new JSONObject(responseString);
        JSONArray itemsArray = responseJson.getJSONArray("Items");

        // 아이템을 하나씩 저장
        for (int i = 0; i < itemsArray.length(); i++) {
            JSONObject itemObject = itemsArray.getJSONObject(i);

            if(itemObject.getString("Name").contains("결정")) {
                continue;
            }

            CraftEntity entity = craftRepository.findByName(itemObject.getString("Name"));
            // 하나씩 저장
            if (entity == null) {
                // CraftEntity로 변환
                entity = new CraftEntity();
                entity.setItemId(itemObject.getInt("Id"));
                entity.setSubCode(code);
                entity.setName(itemObject.getString("Name"));
                entity.setGrade(itemObject.getString("Grade"));
                entity.setIconLink(itemObject.getString("Icon"));
                entity.setBundleCount(itemObject.getInt("BundleCount"));
            }
            entity.setCurrentMinPrice(itemObject.getDouble("CurrentMinPrice"));
            entity.setRecentPrice(itemObject.getDouble("RecentPrice"));
            entity.setYDayAvgPrice(itemObject.getDouble("YDayAvgPrice"));
            craftRepository.save(entity);
            // 하나씩 저장
            craftRepository.save(entity);  // 하나씩 저장
        }
    }

    // jsonInputString을 생성하는 메소드
    private String createJsonInputString(int code, String itemName) {
        if(Objects.equals(itemName, "null"))
            return "{"
                + "\"Sort\": \"GRADE\","
                + "\"CategoryCode\": " + code + ","
                + "\"CharacterClass\": null,"
                + "\"ItemTier\": null,"
                + "\"ItemGrade\": null,"
                + "\"ItemName\": null,"
                + "\"PageNo\": 0,"
                + "\"SortCondition\": \"ASC\""
                + "}";
        else return "{"
                + "\"Sort\": \"GRADE\","
                + "\"CategoryCode\": " + code + ","
                + "\"CharacterClass\": null,"
                + "\"ItemTier\": null,"
                + "\"ItemGrade\": null,"
                + "\"ItemName\": \"" + itemName + "\","
                + "\"PageNo\": 0,"
                + "\"SortCondition\": \"ASC\""
                + "}";
    }

    private void saveJsonToFile(String jsonData){
        try {
            // 현재 날짜와 시간을 얻음
            String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            // 전체 데이터를 JSON 객체에 저장
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("갱신 시간", currentDateTime); // 날짜 및 시간 추가
            jsonObject.put("시세", new JSONArray(jsonData)); // craftEntities 데이터

            // JSON 파일로 저장
            Files.write(Paths.get("back-end/src/main/resources/craftData.json"), jsonObject.toString(4).getBytes());
        } catch (IOException e) {
            throw new CraftDataException("JSON 파일 저장 중 오류가 발생했습니다");
        }
    }

    public String readJsonFromFile() {
        try {
            return Files.readString(Paths.get("back-end/src/main/resources/craftData.json"));
        } catch (IOException e) {
            throw new CraftDataException("JSON 파일 읽기 중 오류가 발생했습니다");
        }
    }

    public Object parseJsonToObject(String jsonData){
        try {
            return objectMapper.readValue(jsonData, Object.class);
        } catch (JsonProcessingException e) {
            throw new CraftDataException("JSON 데이터를 객체로 변환 중 오류가 발생했습니다");
        }
    }
}