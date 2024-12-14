    package moaloa.store.back_end.config;

    import org.springframework.context.annotation.Configuration;
    import org.springframework.web.servlet.config.annotation.CorsRegistry;
    import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

    @Configuration
    public class WebConfig implements WebMvcConfigurer {

        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/**") // 모든 경로에 대해 CORS 허용
                    .allowedOrigins("https://moaloa.org") // 특정 도메인만 허용
                    .allowedMethods("GET", "POST") // 허용할 HTTP 메서드
                    .allowedHeaders("*") // 허용할 헤더
                    .allowCredentials(true); // 쿠키 허용 여부
        }
    }
