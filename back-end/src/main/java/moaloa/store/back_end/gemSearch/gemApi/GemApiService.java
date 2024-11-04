package moaloa.store.back_end.gemSearch.gemApi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import moaloa.store.back_end.gemSearch.crawling.CrawlingEntity;
import moaloa.store.back_end.gemSearch.crawling.CrawlingRepository;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.List;

@Slf4j
@Service
@Component
@RequiredArgsConstructor
public class GemApiService {

    private final GemApiRepository gemApiRepository;
    private final CrawlingRepository crawlingRepository;

    private final String[] api;

    public void loaAPI() {
        try {
            List<CrawlingEntity> users = crawlingRepository.findAll(); // 모든 사용자 가져오기
            int apiIndex = 0;
            int userCount = 0;

            for (CrawlingEntity user : users) {
                if (userCount >= 100) {  // 100명 검색 후 다음 API로 전환
                    apiIndex++;
                    userCount = 0;

                    if (apiIndex >= api.length) {  // 모든 API 키를 사용했다면 1분 대기 후 다시 첫 번째 API로
                        apiIndex = 0;
                        log.info("모든 API 키를 사용했습니다. 1분 동안 대기 중...");
                        Thread.sleep(60000);  // 1분 대기
                    }
                }
                String apiKey = api[apiIndex];  // 현재 API 키 선택
                String userNickName = user.getUserNickName();
                String characterClassName = user.getCharacterClassName();
                String engraveName = user.getEngraveName();

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
                        if (effectsJson.has("Skills") && effectsJson.getJSONArray("Skills").length() > 0) {
                            JSONArray skillsArray = effectsJson.getJSONArray("Skills");

                            for (int j = 0; j < skillsArray.length(); j++) {
                                JSONObject skill = skillsArray.getJSONObject(j);
                                String skillName = skill.getString("Name");
                                JSONArray descriptionArray = skill.getJSONArray("Description");

                                String description = descriptionArray.length() > 0 ? descriptionArray.getString(0) : "";
                                String gemType = null;

                                if (description.contains("재사용")) {
                                    System.out.println("스킬 이름 (재사용): " + skillName);
                                    System.out.println("설명: " + description);
                                    gemType = "작";
                                } else if (description.contains("피해")||description.contains("지원")) {
                                    System.out.println("스킬 이름 (피해): " + skillName);
                                    System.out.println("설명: " + description);
                                    gemType = "겁";
                                } else {
                                    System.out.println("스킬 이름 및 설명에 '재사용' 또는 '피해'가 포함되어 있지 않습니다.");
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
                        } else {
                            log.error("Skills 데이터가 없습니다.");
                        }
                    } else {
                        log.error("Effects 데이터가 없습니다.");
                    }
                } catch (JSONException e) {
                    log.error("JSON 파싱 오류: {}", e.getMessage());
                }

                userCount++;  // 요청 후 사용자 카운트 증가
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to call API: " + e.getMessage(), e);
        }
    }
}