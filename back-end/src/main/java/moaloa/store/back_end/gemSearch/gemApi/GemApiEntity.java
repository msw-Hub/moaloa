package moaloa.store.back_end.gemSearch.gemApi;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
public class GemApiEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String characterClassName;
    private String skillName;
    private String gemType;
    private String engraveType;
    private int count;
}


/*
    직업 / 스킬 / 겁작종류 / 직업각인종류 / 카운팅
    1. 해당 직업의 스킬이 db에 존재하는지 찾는다
    2. 존재한다면 카운팅만 늘린다
    3. 존재하지 않는다면 한줄 생성하고 카운팅을 1로 한다


    ++추가작업 / 직업종류 2개의 카운팅을 더한다
 */