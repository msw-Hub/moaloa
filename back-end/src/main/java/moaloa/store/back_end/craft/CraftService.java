package moaloa.store.back_end.craft;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import moaloa.store.back_end.craft.Dto.CraftRecipeDto;
import moaloa.store.back_end.craft.Entity.CraftItemEntity;
import moaloa.store.back_end.craft.Entity.CraftMaterialEntity;
import moaloa.store.back_end.craft.Entity.CraftRecipeEntity;
import moaloa.store.back_end.craft.Entity.CraftRecipeMaterialEntity;
import moaloa.store.back_end.craft.Repositoy.CraftItemRepository;
import moaloa.store.back_end.craft.Repositoy.CraftMaterialRepository;
import moaloa.store.back_end.craft.Repositoy.CraftRecipeMaterialRepository;
import moaloa.store.back_end.craft.Repositoy.CraftRecipeRepository;
import moaloa.store.back_end.exception.custom.CraftApiGetException;
import moaloa.store.back_end.exception.custom.CraftDataException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
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
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CraftService {

    private final String[] craftApi;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final CraftItemRepository craftItemRepository;
    private final CraftMaterialRepository craftMaterialRepository;
    private final CraftRecipeRepository craftRecipeRepository;
    private final CraftRecipeMaterialRepository craftRecipeMaterialRepository;
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
    @Value("${jsonFile.craftData}")
    private String filePath;

    int count = 0;

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

                    String responseString = result.toString();
                    log.info("responseString: {}", responseString);
                    // 시세 데이터 갱신

                    updateCraftPrice(responseString, code);
                    // 연결을 명시적으로 닫음
                    conn.disconnect();
                }
            }
            //시세 갱신된 데이터를 json 파일로 저장. 이때, json 구조를 변경해야함
            saveJsonToFile();
        } catch (Exception e) {
            log.error("Craft API 호출 중 오류가 발생했습니다", e);
            throw new CraftApiGetException("로스트아크 API 호출 중 오류가 발생했습니다.");

        }
    }

    @Transactional
    protected void updateCraftPrice(String responseString, int code) {  //에러 핸들러 바꿔야함
        try {
            JSONObject jsonObject = new JSONObject(responseString);
            if(jsonObject.has("Items")) {
                JSONArray jsonArray = jsonObject.getJSONArray("Items");
                if(jsonArray.isEmpty()) {
                    throw new CraftDataException("JSON 데이터에 Items 항목이 존재하지 않습니다");
                }

                for(int i = 0; i < jsonArray.length(); i++) {
                    JSONObject item = jsonArray.getJSONObject(i);
                    int marketId = item.getInt("Id");
                    String marketName = item.getString("Name");
                    double currentMinPrice = item.getDouble("CurrentMinPrice");
                    double recentPrice = item.getDouble("RecentPrice");
                    double yDayAvgPrice = item.getDouble("YDayAvgPrice");


                    log.info("marketId: {}, marketName: {}, currentMinPrice: {}, recentPrice: {}, yDayAvgPrice: {}, code: {}",
                            marketId, marketName, currentMinPrice, recentPrice, yDayAvgPrice, code);
                    count++;
                    log.info("count: {}", count);

                    //제작 재료 아이템에 해당되는 아이템만 업데이트
                    if ((code > 90000 && !marketName.contains("결정"))
                            || (code == 60300 && !marketName.contains("빛나는"))
                            || (code == 60200 && marketId == 101036)
                            || (code == 60400 && (marketName.equals("신호탄") || marketName.equals("만능 물약") || marketName.equals("성스러운 부적")) && !marketName.contains("빛나는"))
                            || (code == 60500 && (marketName.equals("신속 로브") || marketName.equals("진군의 깃발")) && !marketName.contains("빛나는"))
                    ) {
                        log.info("제작 재료에 해당되는 아이템입니다");
                        CraftMaterialEntity craftMaterialEntity = craftMaterialRepository.findByMarketId(marketId);
                        if (craftMaterialEntity == null) {
                            throw new CraftDataException("DB에 존재하지 않는 아이템입니다");
                        }
                        craftMaterialEntity.setCurrentMinPrice(currentMinPrice);
                        craftMaterialEntity.setRecentPrice(recentPrice);
                        craftMaterialEntity.setYDayAvgPrice(yDayAvgPrice);
                        craftMaterialRepository.save(craftMaterialEntity);
                    }
                    // 제작 아이템에 해당 되는 아이템만 업데이트
                    if (code < 90000) {
                        log.info("제작 아이템에 해당되는 아이템입니다");
                        List<CraftItemEntity> craftItemEntities = craftItemRepository.findAllByMarketId(marketId);
                        if (craftItemEntities.isEmpty()) {
                            throw new CraftDataException("DB에 존재하지 않는 아이템입니다");
                        } //같은 이름의 아이템이 여러개일 수 있음 - 한번에 다 바꾸기
                        for (CraftItemEntity craftItemEntity : craftItemEntities) {
                            craftItemEntity.setCurrentMinPrice(currentMinPrice);
                            craftItemEntity.setRecentPrice(recentPrice);
                            craftItemEntity.setYDayAvgPrice(yDayAvgPrice);
                            craftItemRepository.save(craftItemEntity);
                        }
                    }
                    log.info("현재 작업을 완료 아이템은 {} 입니다", marketName);
                }
            } else {
                throw new CraftDataException("JSON 데이터에 Items 항목이 존재하지 않습니다");
            }
        } catch (JSONException e) {
            log.error("JSON 파싱 중 오류가 발생했습니다: {}", responseString, e);
            throw new CraftDataException("JSON 데이터를 객체로 변환 중 오류가 발생했습니다");
        } catch (Exception e) {
            log.error("JSON 데이터를 객체로 변환 중 오류가 발생했습니다", e);
            throw new CraftDataException("JSON 데이터를 객체로 변환 중 오류가 발생했습니다");
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

    public void saveJsonToFile() throws IOException {
        // 레시피를 가져옴
        List<CraftRecipeEntity> craftRecipeEntities = craftRecipeRepository.findAll();

        // 현재 날짜와 시간을 얻음
        String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        // CraftRecipeEntity를 CraftRecipeDto로 변환
        List<CraftRecipeDto> craftRecipeDtos = craftRecipeEntities.stream()
                .map(craftRecipeEntity -> new CraftRecipeDto(craftRecipeEntity, craftRecipeEntity.getCraftItem())) // CraftRecipeDto 생성 시 필요한 Entity 추가
                .collect(Collectors.toList());

        // JSON 객체 생성
        Map<String, Object> jsonMap = new HashMap<>();
        jsonMap.put("갱신시간", currentDateTime);
        jsonMap.put("craftItemList", craftRecipeDtos);

        // ObjectMapper를 사용하여 Map을 JSON으로 변환
        ObjectMapper objectMapper = new ObjectMapper();
        String jsonString = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonMap);

        // JSON 파일로 저장
        Files.write(Paths.get(filePath), jsonString.getBytes());
    }

    public String readJsonFromFile() {
        try {
            return Files.readString(Paths.get(filePath));
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