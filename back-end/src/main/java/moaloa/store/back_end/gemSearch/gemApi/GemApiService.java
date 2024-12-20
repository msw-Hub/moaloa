package moaloa.store.back_end.gemSearch.gemApi;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import moaloa.store.back_end.exception.custom.GemDataException;
import moaloa.store.back_end.exception.custom.GemPriceApiException;
import moaloa.store.back_end.exception.custom.UserNotFoundException;
import moaloa.store.back_end.exception.custom.GemApiGetException;
import moaloa.store.back_end.gemSearch.crawling.CrawlingEntity;
import moaloa.store.back_end.gemSearch.crawling.CrawlingRepository;
import moaloa.store.back_end.gemSearch.gemData.EngraveCountCache;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.net.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@Component
@RequiredArgsConstructor
public class GemApiService {

    private final GemApiRepository gemApiRepository;
    private final CrawlingRepository crawlingRepository;
    private final GemPriceRepository gemPriceRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String[] api;
    private final String[] craftApi;

    private final EngraveCountCache engraveCountCache;

    @Value("${jsonFile.gemPrice}")
    private String filePath;


    @Transactional
    public void loaAPI() {
        try {
            List<CrawlingEntity> users = crawlingRepository.findAll(); // 모든 사용자 가져오기
            // users가 비었을 경우 예외 발생
            if (users.isEmpty()) {
                throw new UserNotFoundException("db에 크롤링 정보가 없습니다.");
            }

            int apiIndex = 0;
            int userCount = 0;

            // 카운트 데이터 초기화
            engraveCountCache.reset2();
            gemApiRepository.deleteAll();

            for (CrawlingEntity user : users) {
                if (userCount >= 80) {  // 80명 검색 후 다음 API로 전환
                    apiIndex++;
                    userCount = 0;

                    if (apiIndex >= api.length) {  // 모든 API 키를 사용했다면 1분 대기 후 다시 첫 번째 API로
                        apiIndex = 0;
                        log.info("모든 API 키를 사용했습니다. 60초 동안 대기 중...");
                        Thread.sleep(60000);  // 60초 대기
                    }
                }

                String apiKey = api[apiIndex];  // 현재 API 키 선택
                String userNickName = user.getUserNickName();
                String characterClassName = user.getCharacterClassName();
                String engraveName = user.getEngraveName();

                log.info("=================================================================================");
                log.info("userCount: {}", userCount);
                log.info("User NickName: {}", userNickName);
                log.info("Character Class Name: {}", characterClassName);
                log.info("Engrave Name: {}", engraveName);

                String encodedUserNickName = URLEncoder.encode(userNickName, "UTF-8");
                String reqURL = "https://developer-lostark.game.onstove.com/armories/characters/" + encodedUserNickName + "/gems";
                log.info("Calling API: {}", reqURL);
                URL url = new URL(reqURL);

                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("Authorization", "bearer " + apiKey);
                conn.setRequestProperty("Accept", "application/json");

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
                    JSONObject gemJson = new JSONObject(responseString);
                    if (gemJson.has("Effects")) {
                        JSONObject effectsJson = gemJson.getJSONObject("Effects");
                        if (effectsJson.has("Skills") && !effectsJson.getJSONArray("Skills").isEmpty()) {
                            JSONArray skillsArray = effectsJson.getJSONArray("Skills");

                            if(skillsArray.length()!=11) continue; // 보석이 11개가 아닌 경우 건너뜀


                            for (int j = 0; j < skillsArray.length(); j++) {
                                JSONObject skill = skillsArray.getJSONObject(j);
                                String skillName = skill.getString("Name");
                                JSONArray descriptionArray = skill.getJSONArray("Description");

                                String description = !descriptionArray.isEmpty() ? descriptionArray.getString(0) : "";
                                String gemType = null;

                                if (description.contains("재사용")) {
                                    gemType = "작";
                                } else if (description.contains("피해")||description.contains("지원")) {
                                    gemType = "겁";
                                }

                                GemApiEntity gemApiEntity = gemApiRepository.findByCharacterClassNameAndSkillNameAndGemTypeAndEngraveType(characterClassName, skillName, gemType, engraveName);
                                if (gemApiEntity != null) {
                                    gemApiEntity.setCount(gemApiEntity.getCount() + 1);
                                    gemApiRepository.save(gemApiEntity);
                                } else {
                                    GemApiEntity newGemApiEntity = new GemApiEntity();
                                    newGemApiEntity.setCharacterClassName(characterClassName);
                                    newGemApiEntity.setSkillName(skillName);
                                    newGemApiEntity.setGemType(gemType);
                                    newGemApiEntity.setEngraveType(engraveName);
                                    newGemApiEntity.setCount(1);
                                    gemApiRepository.save(newGemApiEntity);
                                }
                            }
                            // 직업각인 카운트 증가
                            engraveCountCache.updateActualUserCount(engraveName, 1);

                        } else {
                            log.warn("Skills 데이터가 없습니다.");
                        }
                    } else {
                        log.warn("Effects 데이터가 없습니다.");
                    }
                } catch (JSONException e) {
                    log.warn("키 혹은 닉네임 변경으로 인한 오류일 수 있습니다. // JSON 파싱 오류: {}", e.getMessage());
                    log.info("해당 유저 : {}", userNickName);
                    continue;
                }
                userCount++;  // 요청 후 사용자 카운트 증가
            }
            log.info("집계 결과: {}", engraveCountCache.getActualUserCountMap());
        } catch (Exception e) {
            throw new GemApiGetException("로아 API 요청 중 오류 발생: " + e.getMessage());
        }
    }

    private final String[] gemCategory = {"5레벨 멸", "6레벨 멸", "7레벨 멸", "8레벨 멸", "9레벨 멸", "10레벨 멸",
            "5레벨 홍", "6레벨 홍", "7레벨 홍", "8레벨 홍", "9레벨 홍", "10레벨 홍","5레벨 겁", "6레벨 겁", "7레벨 겁", "8레벨 겁", "9레벨 겁", "10레벨 겁",
            "5레벨 작", "6레벨 작", "7레벨 작", "8레벨 작", "9레벨 작", "10레벨 작"};

    /*
        * 보석 시세를 가져오는 메서드
     */
    @Transactional
    public void getGemPrice() {
        String reqURL = "https://developer-lostark.game.onstove.com/auctions/items";

        try {
            for (String gemName : gemCategory) {
                HttpURLConnection conn = (HttpURLConnection) new URL(reqURL).openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Authorization", "bearer " + craftApi[1]);
                conn.setRequestProperty("Accept", "application/json");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);

                String jsonInputString = createJsonInputString(gemName);

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

                saveGemPrice(result);

                // 연결을 명시적으로 닫음
                conn.disconnect();
            }
            List<GemPriceEntity> gemPriceEntities = gemPriceRepository.findAll();
            if(gemPriceEntities.isEmpty()) {
                log.error("GemPriceEntity가 비어있습니다.");
                throw new GemDataException("GemPriceEntity가 비어있습니다.");
            }
            String jsonResult = objectMapper.writeValueAsString(gemPriceEntities);
            saveJsonToFile(jsonResult);
        } catch (IOException e) {
            throw new GemPriceApiException("로아 api 요청으로 보석 시세를 가져오는 중 오류가 발생했습니다");
        }
    }

    @Transactional
    protected void saveGemPrice(StringBuilder result){
        String responseString = result.toString();
        // JSON 응답 파싱
        JSONObject responseJson = new JSONObject(responseString);
        JSONArray itemsArray = responseJson.getJSONArray("Items");
        if (!itemsArray.isEmpty()) {
            JSONObject cheapestItem = itemsArray.getJSONObject(0);
            String gemName = cheapestItem.getString("Name");
            int tier = cheapestItem.getInt("Tier");
            int buyPrice = cheapestItem.getJSONObject("AuctionInfo").getInt("BuyPrice");

            GemPriceEntity gemPriceEntity = gemPriceRepository.findByGemName(gemName);
            if (gemPriceEntity != null) {
                gemPriceEntity.setBuyPrice(buyPrice);
                gemPriceRepository.save(gemPriceEntity);
            } else {
                GemPriceEntity newGemPriceEntity = new GemPriceEntity();
                newGemPriceEntity.setGemTier(tier);
                newGemPriceEntity.setGemName(gemName);
                newGemPriceEntity.setBuyPrice(buyPrice);
                gemPriceRepository.save(newGemPriceEntity);
            }
        } else {
            log.warn("로아 api 요청은 정상 처리되었으나, 보석 데이터가 없습니다. 아마 해당 보석 매물이 없는 것으로 보입니다.");
        }
    }

    private String createJsonInputString(String gemName) {
        return "{"
                + "\"ItemLevelMin\": 0,"
                + "\"ItemLevelMax\": 0,"
                + "\"ItemGradeQuality\": null,"
                + "\"ItemUpgradeLevel\": null,"
                + "\"ItemTradeAllowCount\": null,"
                + "\"SkillOptions\": ["
                + "  {"
                + "    \"FirstOption\": null,"
                + "    \"SecondOption\": null,"
                + "    \"MinValue\": null,"
                + "    \"MaxValue\": null"
                + "  }"
                + "],"
                + "\"EtcOptions\": ["
                + "  {"
                + "    \"FirstOption\": null,"
                + "    \"SecondOption\": null,"
                + "    \"MinValue\": null,"
                + "    \"MaxValue\": null"
                + "  }"
                + "],"
                + "\"Sort\": \"BUY_PRICE\","
                + "\"CategoryCode\": 210000,"
                + "\"CharacterClass\": null,"
                + "\"ItemTier\":  null,"
                + "\"ItemGrade\": null,"
                + "\"ItemName\": \"" + gemName + "\","
                + "\"PageNo\": 0,"
                + "\"SortCondition\": \"ASC\""
                + "}";

    }

    private void saveJsonToFile(String jsonData) {
        try {
            // 현재 날짜와 시간을 얻음
            String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            // 전체 데이터를 JSON 객체로 저장
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("갱신 시간", currentDateTime); // 날짜 및 시간 추가

            // 데이터 변환
            JSONArray jsonArray = new JSONArray(jsonData);
            JSONObject Object = new JSONObject();

            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject gem = jsonArray.getJSONObject(i);
                String gemName = gem.getString("gemName");

                JSONObject gemData = new JSONObject();
                gemData.put("buyPrice", gem.getInt("buyPrice"));
                gemData.put("gemTier", gem.getInt("gemTier"));

                Object.put(gemName, gemData);
            }

            // JSON 데이터 완성
            jsonObject.put("시세", Object);

            // JSON 파일로 저장
            Files.write(Paths.get(filePath), jsonObject.toString(4).getBytes());
        } catch (IOException e) {
            throw new GemDataException("보석 시세 JSON 파일 저장 중 오류가 발생했습니다");
        }
    }

    public String readJsonFromFile() {
        try {
            return Files.readString(Paths.get(filePath));
        } catch (IOException e) {
            throw new GemDataException("보석 시세 JSON 파일 읽기 중 오류가 발생했습니다");
        }
    }

    public Object parseJsonToObject(String jsonData){
        try {
            return objectMapper.readValue(jsonData, Object.class);
        } catch (JsonProcessingException e) {
            throw new GemDataException("보석 시세 JSON 데이터를 객체로 변환 중 오류가 발생했습니다");
        }
    }
}