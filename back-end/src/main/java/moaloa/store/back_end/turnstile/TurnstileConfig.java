package moaloa.store.back_end.turnstile;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TurnstileConfig {

    @Bean
    public String turnstileService(
            @Value("${turnstile.secret}") String secretKey
    ) {
        return secretKey;
    }
}
