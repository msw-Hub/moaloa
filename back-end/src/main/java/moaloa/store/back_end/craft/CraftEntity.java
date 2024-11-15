package moaloa.store.back_end.craft;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class CraftEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int itemId;
    private int subCode;
    private String name;
    private String grade;
    private String iconLink;
    private int bundleCount;
    private double currentMinPrice;
    private double recentPrice;
    private double yDayAvgPrice;

}
