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
public class GemPriceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int gemTier;    //3, 4
    private String gemName; //5레벨 멸화의 보석 ...
    private int buyPrice;

}
