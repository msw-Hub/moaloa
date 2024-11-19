package moaloa.store.back_end.craft.Dto;


import lombok.Getter;
import lombok.Setter;
import moaloa.store.back_end.craft.Entity.CraftMaterialEntity;

@Getter
@Setter
public class CraftMaterialDto {

    private int id;
    private String marketName;
    private String grade;
    private double currentMinPrice;
    private double recentPrice;
    private double yDayAvgPrice;
    private int marketId;
    private int subCode;
    private String iconLink;
    private int bundleCount;
    private int quantity;

    public CraftMaterialDto(CraftMaterialEntity craftMaterial, int quantity) {
        this.id = craftMaterial.getId();
        this.marketName = craftMaterial.getMarketName();
        this.grade = craftMaterial.getGrade();
        this.currentMinPrice = craftMaterial.getCurrentMinPrice();
        this.recentPrice = craftMaterial.getRecentPrice();
        this.yDayAvgPrice = craftMaterial.getYDayAvgPrice();
        this.marketId = craftMaterial.getMarketId();
        this.subCode = craftMaterial.getSubCode();
        this.iconLink = craftMaterial.getIconLink();
        this.bundleCount = craftMaterial.getBundleCount();
        this.quantity = quantity;
    }

}