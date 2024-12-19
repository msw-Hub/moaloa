package moaloa.store.back_end.craft;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CraftKeyConfig {

    @Bean
    public String[] craftApi(
            @Value("${loa.craft.key6}") String craftKey6,
            @Value("${loa.craft.key7}") String craftKey7
    ) {
        return new String[]{craftKey6, craftKey7};
    }
}