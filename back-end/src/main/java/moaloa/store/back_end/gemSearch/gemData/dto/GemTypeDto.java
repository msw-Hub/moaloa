package moaloa.store.back_end.gemSearch.gemData.dto;

import lombok.Data;

import java.util.List;

@Data
public class GemTypeDto {
    private String gemType;
    private List<GemDto> gems;

    public GemTypeDto(String gemType, List<GemDto> gems) {
        this.gemType = gemType;
        this.gems = gems;
    }
}
