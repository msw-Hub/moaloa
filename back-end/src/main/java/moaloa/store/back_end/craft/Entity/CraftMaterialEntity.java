package moaloa.store.back_end.craft.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class CraftMaterialEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int marketId; // 거래소내 아이템 ID
    private String marketName; // 거래소내 이름
    private int subCode; // 카테고리
    private int bundleCount; // 거래소 묶음 수량
    private String iconLink; // 아이콘 링크
    private String grade; // 등급
    private double currentMinPrice; // 현재 최저가
    private double recentPrice; // 최근 거래가
    private double yDayAvgPrice; // 전일 평균 거래가
}
