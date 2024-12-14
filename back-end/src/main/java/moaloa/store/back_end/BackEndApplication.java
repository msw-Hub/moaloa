package moaloa.store.back_end;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class BackEndApplication {

	public static void main(String[] args) {
		// 기본 시간대를 한국 시간(KST)으로 설정
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));

		SpringApplication.run(BackEndApplication.class, args);
	}

}
