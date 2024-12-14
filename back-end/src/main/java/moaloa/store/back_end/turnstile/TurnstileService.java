package moaloa.store.back_end.turnstile;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Service
@RequiredArgsConstructor
public class TurnstileService {

    @Value("${turnstile.secretKey}")
    private String secretKey;

    public TurnstileDto verifyTurnstile(String token, String remoteIp) {
        log.info("토큰 검증을 시작합니다. token: {}", token);

        // 요청을 구성
        String TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
        String url = UriComponentsBuilder.fromHttpUrl(TURNSTILE_VERIFY_URL)
                .queryParam("secret", secretKey)
                .queryParam("response", token)
                .queryParam("remoteip", remoteIp)
                .toUriString();

        // RestTemplate을 이용한 HTTP 요청
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<TurnstileDto> response = restTemplate.postForEntity(url, null, TurnstileDto.class);

        if (response.getBody() != null) {
            TurnstileDto responseBody = response.getBody();
            if (responseBody.isSuccess()) {
                // Turnstile 검증이 성공한 경우
                return responseBody;
            } else {
                // Turnstile 검증이 실패한 경우
                log.error("Turnstile 검증에 실패하였습니다. errorCodes: {}", (Object) responseBody.getErrorCodes());
            }
        }
        return null; // 실패 시 null 반환
    }
}
