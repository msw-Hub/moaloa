package moaloa.store.back_end.craft;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CraftService {

    private final String[] craftApi;
    private final CraftRepository craftRepository;
    // "Subs" 항목 코드들
    int[] subsCodes = {90200, 90300, 90400, 90500, 90600, 90700};
    /*
        90200: 식물채집 전리품
        90300: 벌목 전리품
        90400: 채광 전리품
        90500: 수렵 전리품
        90600: 낚시 전리품
        90700: 고고학 전리품
     */

    @Transactional
    public void getLoaApi() {
        String reqURL = "https://developer-lostark.game.onstove.com/markets/items";
        try {
            // "Subs" 항목을 반복하여 JSON 요청 데이터 생성
            for (int code : subsCodes) {
                // 연결을 새로 열고 요청을 보내기 전에 데이터를 준비
                HttpURLConnection conn = (HttpURLConnection) new URL(reqURL).openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Authorization", "bearer " + craftApi[0]);
                conn.setRequestProperty("Accept", "application/json");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                String jsonInputString = createJsonInputString(code);

                // JSON 데이터 전송
                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonInputString.getBytes("utf-8");
                    os.write(input, 0, input.length);
                }

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

                // 데이터 저장
                saveItemsOneByOne(result, code);

                // 연결을 명시적으로 닫음
                conn.disconnect();
            }

        } catch (Exception e) {
            log.error("Error during API call", e);
        }
    }


    @Transactional
    protected void saveItemsOneByOne(StringBuilder result, int code) {
        String responseString = result.toString();

        // JSON 응답 파싱
        JSONObject responseJson = new JSONObject(responseString);
        JSONArray itemsArray = responseJson.getJSONArray("Items");

        // 아이템을 하나씩 저장
        for (int i = 0; i < itemsArray.length(); i++) {
            JSONObject itemObject = itemsArray.getJSONObject(i);
            log.info("Item: {}", itemObject);
            log.info("====================================");

            if(itemObject.getString("Name").contains("결정")||itemObject.getString("Name").contains("진귀한")) {
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
    private String createJsonInputString(int code) {
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
    }
}