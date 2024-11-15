package moaloa.store.back_end.gemSearch.gemData;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Getter
@Component
public class GemDataCache {

    private final Map<String, Integer> classCountMap = new HashMap<>();

    @PostConstruct
    public void init() {
        reset();
    }

    public void reset() {
        classCountMap.clear();
        classCountMap.put("디스트로이어", 0);
        classCountMap.put("워로드", 0);
        classCountMap.put("버서커", 0);
        classCountMap.put("홀리나이트", 0);
        classCountMap.put("슬레이어", 0);
        classCountMap.put("스트라이커", 0);
        classCountMap.put("브레이커", 0);
        classCountMap.put("배틀마스터", 0);
        classCountMap.put("인파이터", 0);
        classCountMap.put("기공사", 0);
        classCountMap.put("창술사", 0);
        classCountMap.put("데빌헌터", 0);
        classCountMap.put("블래스터", 0);
        classCountMap.put("호크아이", 0);
        classCountMap.put("스카우터", 0);
        classCountMap.put("건슬링어", 0);
        classCountMap.put("바드", 0);
        classCountMap.put("서머너", 0);
        classCountMap.put("아르카나", 0);
        classCountMap.put("소서리스", 0);
        classCountMap.put("블레이드", 0);
        classCountMap.put("데모닉", 0);
        classCountMap.put("리퍼", 0);
        classCountMap.put("소울이터", 0);
        classCountMap.put("도화가", 0);
        classCountMap.put("기상술사", 0);
    }

    public void updateClassCount(String className, int count) {
        classCountMap.put(className, classCountMap.getOrDefault(className, 0) + count);
    }
}
