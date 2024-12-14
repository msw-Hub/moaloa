package moaloa.store.back_end.craft;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CraftKeyConfig {

    @Bean
    public String[] craftApi(
            @Value("${loa.craft.key0}") String craftKey0,
            @Value("${loa.craft.key6}") String craftKey6,
            @Value("${loa.craft.key7}") String craftKey7,
            @Value("${loa.craft.key8}") String craftKey8
    ) {
        return new String[]{craftKey0+craftKey6, craftKey0+craftKey7, craftKey0+craftKey8};
    }
}