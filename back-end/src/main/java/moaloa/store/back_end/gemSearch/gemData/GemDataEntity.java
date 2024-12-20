package moaloa.store.back_end.gemSearch.gemData;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
public class GemDataEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Lob // CLOB, TEXT 타입을 사용하려면 @Lob 어노테이션을 사용
    private String jsonString;

}
