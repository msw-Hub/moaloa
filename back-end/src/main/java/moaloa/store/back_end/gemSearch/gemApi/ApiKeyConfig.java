package moaloa.store.back_end.gemSearch.gemApi;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApiKeyConfig {

    @Bean
    public String[] api(
            @Value("${loa.api.key0}") String apiKey0,
            @Value("${loa.api.key1}") String apiKey1,
            @Value("${loa.api.key2}") String apiKey2,
            @Value("${loa.api.key3}") String apiKey3,
            @Value("${loa.api.key4}") String apiKey4,
            @Value("${loa.api.key5}") String apiKey5
    ) {
        return new String[]{apiKey0+apiKey1, apiKey0+apiKey2, apiKey0+apiKey3, apiKey0+apiKey4, apiKey0+apiKey5};
    }
}