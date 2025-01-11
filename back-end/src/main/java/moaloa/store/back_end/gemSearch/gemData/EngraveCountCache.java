package moaloa.store.back_end.gemSearch.gemData;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Getter
@Component
public class EngraveCountCache {

    private final Map<String, Integer> engraveCountMap = new HashMap<>();   //상위 100명의 각인 채용 횟수
    private final Map<String, Integer> actualUserCountMap = new HashMap<>();    //각 직업각인별 상위 50명 중 집계 가능 인원 수

    @PostConstruct
    public void init() {
        reset1();
        reset2();
    }

    public void reset1() {
        engraveCountMap.clear();
        engraveCountMap.put("분노의망치", 0);
        engraveCountMap.put("중력수련", 0);
        engraveCountMap.put("고독한기사", 0);
        engraveCountMap.put("전투태세", 0);
        engraveCountMap.put("광기", 0);
        engraveCountMap.put("광전사의비기", 0);
        engraveCountMap.put("심판자", 0);
        engraveCountMap.put("축복의오라", 0);
        engraveCountMap.put("처단자", 0);
        engraveCountMap.put("포식자", 0);
        engraveCountMap.put("오의난무", 0);
        engraveCountMap.put("일격필살", 0);
        engraveCountMap.put("권왕파천무", 0);
        engraveCountMap.put("수라의길", 0);
        engraveCountMap.put("오의강화", 0);
        engraveCountMap.put("초심", 0);
        engraveCountMap.put("체술", 0);
        engraveCountMap.put("충격단련", 0);
        engraveCountMap.put("세맥타통", 0);
        engraveCountMap.put("역천지체", 0);
        engraveCountMap.put("절정", 0);
        engraveCountMap.put("절제", 0);
        engraveCountMap.put("강화무기", 0);
        engraveCountMap.put("핸드거너", 0);
        engraveCountMap.put("포격강화", 0);
        engraveCountMap.put("화력강화", 0);
        engraveCountMap.put("두번째동료", 0);
        engraveCountMap.put("죽음의습격", 0);
        engraveCountMap.put("아르데타인의기술", 0);
        engraveCountMap.put("진화의유산", 0);
        engraveCountMap.put("사냥의시간", 0);
        engraveCountMap.put("피스메이커", 0);
        engraveCountMap.put("절실한구원", 0);
        engraveCountMap.put("진실된용맹", 0);
        engraveCountMap.put("넘치는교감", 0);
        engraveCountMap.put("상급소환사", 0);
        engraveCountMap.put("황제의칙령", 0);
        engraveCountMap.put("황후의은총", 0);
        engraveCountMap.put("점화", 0);
        engraveCountMap.put("환류", 0);
        engraveCountMap.put("버스트", 0);
        engraveCountMap.put("잔재된기운", 0);
        engraveCountMap.put("멈출수없는충동", 0);
        engraveCountMap.put("완벽한억제", 0);
        engraveCountMap.put("갈증", 0);
        engraveCountMap.put("달의소리", 0);
        engraveCountMap.put("만월의집행자", 0);
        engraveCountMap.put("그믐의경계", 0);
        engraveCountMap.put("만개", 0);
        engraveCountMap.put("회귀", 0);
        engraveCountMap.put("이슬비", 0);
        engraveCountMap.put("질풍술사", 0);
        engraveCountMap.put("야성",0);
        engraveCountMap.put("환수 각성",0);
    }

    public void reset2(){
        actualUserCountMap.clear();
        actualUserCountMap.put("분노의망치", 0);
        actualUserCountMap.put("중력수련", 0);
        actualUserCountMap.put("고독한기사", 0);
        actualUserCountMap.put("전투태세", 0);
        actualUserCountMap.put("광기", 0);
        actualUserCountMap.put("광전사의비기", 0);
        actualUserCountMap.put("심판자", 0);
        actualUserCountMap.put("축복의오라", 0);
        actualUserCountMap.put("처단자", 0);
        actualUserCountMap.put("포식자", 0);
        actualUserCountMap.put("오의난무", 0);
        actualUserCountMap.put("일격필살", 0);
        actualUserCountMap.put("권왕파천무", 0);
        actualUserCountMap.put("수라의길", 0);
        actualUserCountMap.put("오의강화", 0);
        actualUserCountMap.put("초심", 0);
        actualUserCountMap.put("체술", 0);
        actualUserCountMap.put("충격단련", 0);
        actualUserCountMap.put("세맥타통", 0);
        actualUserCountMap.put("역천지체", 0);
        actualUserCountMap.put("절정", 0);
        actualUserCountMap.put("절제", 0);
        actualUserCountMap.put("강화무기", 0);
        actualUserCountMap.put("핸드거너", 0);
        actualUserCountMap.put("포격강화", 0);
        actualUserCountMap.put("화력강화", 0);
        actualUserCountMap.put("두번째동료", 0);
        actualUserCountMap.put("죽음의습격", 0);
        actualUserCountMap.put("아르데타인의기술", 0);
        actualUserCountMap.put("진화의유산", 0);
        actualUserCountMap.put("사냥의시간", 0);
        actualUserCountMap.put("피스메이커", 0);
        actualUserCountMap.put("절실한구원", 0);
        actualUserCountMap.put("진실된용맹", 0);
        actualUserCountMap.put("넘치는교감", 0);
        actualUserCountMap.put("상급소환사", 0);
        actualUserCountMap.put("황제의칙령", 0);
        actualUserCountMap.put("황후의은총", 0);
        actualUserCountMap.put("점화", 0);
        actualUserCountMap.put("환류", 0);
        actualUserCountMap.put("버스트", 0);
        actualUserCountMap.put("잔재된기운", 0);
        actualUserCountMap.put("멈출수없는충동", 0);
        actualUserCountMap.put("완벽한억제", 0);
        actualUserCountMap.put("갈증", 0);
        actualUserCountMap.put("달의소리", 0);
        actualUserCountMap.put("만월의집행자", 0);
        actualUserCountMap.put("그믐의경계", 0);
        actualUserCountMap.put("만개", 0);
        actualUserCountMap.put("회귀", 0);
        actualUserCountMap.put("이슬비", 0);
        actualUserCountMap.put("질풍술사", 0);
        actualUserCountMap.put("야성",0);
        actualUserCountMap.put("환수 각성",0);
    }



    public void updateEngraveCount(String className, int count) {
        engraveCountMap.put(className, engraveCountMap.getOrDefault(className, 0) + count);
    }
    public void updateActualUserCount(String className, int count) {
        actualUserCountMap.put(className, actualUserCountMap.getOrDefault(className, 0) + count);
    }
}
