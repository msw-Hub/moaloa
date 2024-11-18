package moaloa.store.back_end.craft.Dto;

import lombok.Getter;
import lombok.Setter;
import moaloa.store.back_end.craft.Entity.CraftItemEntity;
import moaloa.store.back_end.craft.Entity.CraftRecipeEntity;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class CraftRecipeDto {

    private int id;

    private int marketId; // 거래소내 아이템 ID
    private String craftName; // 제작품 이름
    private String marketName; // 거래소내 아이템 이름
    private int category; // 카테고리 { 0:전체 , 1:특수, 2:물약, 3:폭탄, 4:슈류탄, 5:로브, 6:기타, 7:요리 }
    private int craftQuantity; // 1회 생산량
    private int bundleCount; // 거래소 묶음 수량
    private int craftPrice; // 제작 초기 비용
    private int activityPrice; // 1회 소모 활동 비용
    private int exp; // 영지 경험치
    private int craftTime; // 제작 시간
    private String iconLink; // 아이콘 링크
    private String grade; // 등급
    private double currentMinPrice; // 현재 최저가
    private double recentPrice; // 최근 거래가
    private double yDayAvgPrice; // 전일 평균 거래가

    private List<CraftMaterialDto> craftMaterials;  // 수정된 필드

    // 생성자
    public CraftRecipeDto(CraftRecipeEntity craftRecipe, CraftItemEntity craftItem) {
        this.id = craftRecipe.getId();

        this.marketId = craftItem.getMarketId();
        this.craftName = craftItem.getCraftName();
        this.marketName = craftItem.getMarketName();
        this.category = craftItem.getCategory();
        this.craftQuantity = craftItem.getCraftQuantity();
        this.bundleCount = craftItem.getBundleCount();
        this.craftPrice = craftItem.getCraftPrice();
        this.activityPrice = craftItem.getActivityPrice();
        this.exp = craftItem.getExp();
        this.craftTime = craftItem.getCraftTime();
        this.iconLink = craftItem.getIconLink();
        this.grade = craftItem.getGrade();
        this.currentMinPrice = craftItem.getCurrentMinPrice();
        this.recentPrice = craftItem.getRecentPrice();
        this.yDayAvgPrice = craftItem.getYDayAvgPrice();

        this.craftMaterials = craftRecipe.getCraftRecipeMaterials().stream()
                .map(recipeMaterial -> new CraftMaterialDto(recipeMaterial.getCraftMaterial(), recipeMaterial.getQuantity()))
                .collect(Collectors.toList());
    }
}
