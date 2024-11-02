package moaloa.store.back_end.gemSearch.gemApi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import moaloa.store.back_end.gemSearch.crawling.CrawlingEntity;
import moaloa.store.back_end.gemSearch.crawling.CrawlingRepository;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GemApiService {

    private final GemApiRepository gemApiRepository;
    private final CrawlingRepository crawlingRepository;

    private final String[] api = {
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyIsImtpZCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyJ9.eyJpc3MiOiJodHRwczovL2x1ZHkuZ2FtZS5vbnN0b3ZlLmNvbSIsImF1ZCI6Imh0dHBzOi8vbHVkeS5nYW1lLm9uc3RvdmUuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6IjEwMDAwMDAwMDA1Mzg2NzAifQ.mYpIR6HbQLrAG6D2wCknb34e-mPJJ2FOghCbAb6D0ayk1-VztVxbx64J13115VUawhCC0tb497-13uNhpyQHo5YT3M9u8Brae-pECA0GMUO0smf9B9csNj-bG8zNPxY6NU1xJI6XY8LUy5tygsugBBDKhse9Wsgvpm9_hewhfFP1JvLxjyC0oo_Q7pXR0TzX3ENCSImXxzbaDd3P_hQeh9heSdhNqMKcpCawa3-zW907RxRCvDVcBO1ibAg-UTb6CGLhsq_N1Px7tLd-8nIhXM8NDNxjrvjF6Zm0rbCfsoh6Ph6dOEIx_uyXnA7yCr2pRHWmGfvPcfTFbb-Vm1hGuQ",
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyIsImtpZCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyJ9.eyJpc3MiOiJodHRwczovL2x1ZHkuZ2FtZS5vbnN0b3ZlLmNvbSIsImF1ZCI6Imh0dHBzOi8vbHVkeS5nYW1lLm9uc3RvdmUuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6IjEwMDAwMDAwMDA1NjY2MjIifQ.caB2nfw5MQBPD-DGmmNvOJ0awH46ajL4HLWDbnoAmLAobomXWz84fwzbto2y5j3u-FOeJu6H6LphsNrXMCSNW8U2psVfGJzB-JlgR3nc7zsWW_ZgaJtXrj2yMGd4lo0d-9zcRdaH3HabbrZ5JKEB5Cfa6hOHt6Lb0X9s4XCVr7hwKf_viaDdQ6j1wJ5YqmaLEWQrMbCRqam0NPWcHSa98F8JGdAUFgtpIwQLUfLc76MdO2fgCxL0bp2q6e_m5IqjapGbqWTguI3Wc8kvCHMJbQseErSqDZ2DJRR_bu-XszCsM7IPnZuS7137REmHIzgTmZkgbzXEaLOIhkwXbLVCPg",
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyIsImtpZCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyJ9.eyJpc3MiOiJodHRwczovL2x1ZHkuZ2FtZS5vbnN0b3ZlLmNvbSIsImF1ZCI6Imh0dHBzOi8vbHVkeS5nYW1lLm9uc3RvdmUuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6IjEwMDAwMDAwMDA1NjY2MjMifQ.QoLIhXMEoi9xgk1CXaEBSVwWcd_3guOx0VAXZBNyFd4AYA18bwj0cSwNUNbLKSOL_ThHpG1JpzkBFl-W86eg-PzGWjuyLK3l2VP0JCsMteQaaLo6y4iBBMeGD_zkPH2dI0Ae3XLsCGP9wyqJ3QTeRfiJ6D453nL21mzy3yWbXJ69BN1wQ30fy3BCYjczSpf5jha7FR7kknBQSRM-YkNU1ChpyK2HqRYu4s1LtICTklxuMTf7EaqnYtP9wkZI2wSedH5uoMSVG7dJ08WUKioa0O5FRvd1Bwetz0MJ9_y7JOr8fq4stm52EtNr5ljMutvN6tZ8Vqft3b2b42rhyeiQrg",
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyIsImtpZCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyJ9.eyJpc3MiOiJodHRwczovL2x1ZHkuZ2FtZS5vbnN0b3ZlLmNvbSIsImF1ZCI6Imh0dHBzOi8vbHVkeS5nYW1lLm9uc3RvdmUuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6IjEwMDAwMDAwMDA1NjY2MjQifQ.CHIZ-2WngdbTxqVxlFRio5fmrKW81KJqIrYvijKHFKXiGZenAS8kKCqm468aF9DVnEl9DbfkLlpD1lEwJYEvPqu2LaB8ij84T7d1OglsCmTufZfI57vlJyaQgXqIbZ0nVgiHXeiFR9AKSCHITC0WKrEwlZewvdvExDRIlr4k9I6ltc-DVm_z5SdGigmNt3WJxRY0uNjUus9R2VcBfDJ4mLzrRbRE7FBuZq8KIO7Q21sc4_YBnGyZQsrbUdZ5Bt1FIYTLKLuyFr6wRU-2u1nRYNgDg2JTNkUIW7wmWK2WduT9N3ZKnE1ZPhwulnlBx5KiL-XJy8qDlesYgj3_ekfRJg",
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyIsImtpZCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyJ9.eyJpc3MiOiJodHRwczovL2x1ZHkuZ2FtZS5vbnN0b3ZlLmNvbSIsImF1ZCI6Imh0dHBzOi8vbHVkeS5nYW1lLm9uc3RvdmUuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6IjEwMDAwMDAwMDA1NjY2MjUifQ.LWChDL4ZmwsFznNvmfRV2RBRDtrV2fDTxvFqH9p8lzISm66xWeNFCSZ9Q9v67d6IQXTE9SLrHrLQ5TzD__a8N6QBGMZxwjAdEhXkAHd_Vutam-_tuAkfxr0opw4LydWj60ZJxNk6oaVD03XgqVsop62wsnc1ikyz9xfjIfTLabT2eLdWkgsoh-N3TipeLCs6MeXV8CIpoN_hGK-zgMzkbwjMBOpfq6tCGin8I7gTWxH3rQIqo6F6HKzM-cLCw4-Mc3kdr-ZR86_-7qb8mQL25_sQ9LYttRhRueGH1LG2ffGJo7Dugl_q0ifFv-g4SNd5yeZ4jd5KpTRgDjAnHMgAjg"
    };

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