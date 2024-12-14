package moaloa.store.back_end.turnstile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@Slf4j
@Service
@RequiredArgsConstructor
public class TurnstileService {

    @Value("${turnstile.secret}")
    private String secretKey;

    public boolean verifyTurnstile(String token) {
        log.info("토큰 검증을 시작합니다. token: {}", token);

        String reqURL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

        try {
            // URL 객체 생성
            URL url = new URL(reqURL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();

            // HTTP 메서드와 헤더 설정
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            // POST 요청 본문 구성
            String jsonInputString = "{\"secret\": \"" + secretKey + "\", \"response\": \"" + token + "\"}";

            // 응답 코드 확인
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

            // JSON 응답 파싱
            JSONObject jsonObject = new JSONObject(responseString);
            boolean success = jsonObject.getBoolean("success");
            if (success) {
                log.info("토큰 검증 성공");
                return true;
            } else {
                log.info("토큰 검증 실패");
                return false;
            }
        } catch (Exception e) {
            log.error("토큰 검증 중 오류 발생", e);
            return false;
        }
    }
}
