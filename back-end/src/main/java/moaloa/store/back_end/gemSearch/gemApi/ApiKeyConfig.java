package moaloa.store.back_end.gemSearch.gemApi;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// 보석 채용률 수집(GemApiService.loaAPI)에 쓰던 로스트아크 API 키 5개
// - 수집 기능은 스케줄러와 컨트롤러 모두 주석 처리되어 지금은 쓰이지 않는다.
// - 예전 커밋에 키 값이 올라간 적이 있어, 2026-11에 개발자 포털에서 5개 모두 삭제했다. 옛 커밋에 남은 값은 쓸 수 없는 키다.
// - 설정 이름(loa.api.key1~5)은 남겨 둔다. 값이 없으면 앱이 시작되지 않으므로 서버 설정에는 아무 값이라도 있어야 한다.
// - 수집 기능을 다시 켜려면 새 키를 발급해 서버 설정에만 넣는다(저장소에는 올리지 않는다).
@Configuration
public class ApiKeyConfig {

    @Bean
    public String[] api(
            @Value("${loa.api.key1}") String apiKey1,
            @Value("${loa.api.key2}") String apiKey2,
            @Value("${loa.api.key3}") String apiKey3,
            @Value("${loa.api.key4}") String apiKey4,
            @Value("${loa.api.key5}") String apiKey5
    ) {
        return new String[]{apiKey1, apiKey2, apiKey3, apiKey4, apiKey5};
    }
}