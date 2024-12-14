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
    private int marketId;
    private int subCode;
    private String iconLink;
    private int bundleCount;
    private int quantity;

    public CraftMaterialDto(CraftMaterialEntity craftMaterial, int quantity) {
        this.id = craftMaterial.getId();
        this.marketName = craftMaterial.getMarketName();
        this.grade = craftMaterial.getGrade();
        this.marketId = craftMaterial.getMarketId();
        this.subCode = craftMaterial.getSubCode();
        this.iconLink = craftMaterial.getIconLink();
        this.bundleCount = craftMaterial.getBundleCount();
        this.quantity = quantity;
    }

}