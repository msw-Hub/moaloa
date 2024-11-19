package moaloa.store.back_end.craft.Dto;

import lombok.Getter;
import lombok.Setter;
import moaloa.store.back_end.craft.Entity.CraftMaterialEntity;

@Getter
@Setter
public class CraftMaterialLifeDto {

    private int marketId;
    private String marketName;
    private double currentMinPrice;
    private String grade;

    public CraftMaterialLifeDto(CraftMaterialEntity craftMaterialEntity) {
        this.marketId = craftMaterialEntity.getMarketId();
        this.marketName = craftMaterialEntity.getMarketName();
        this.currentMinPrice = craftMaterialEntity.getCurrentMinPrice();
        this.grade = craftMaterialEntity.getGrade();
    }
}
