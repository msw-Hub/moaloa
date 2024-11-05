package moaloa.store.back_end.gemSearch.gemData.dto;

import lombok.Data;

import java.util.List;

@Data
public class GemClassDto {
    private String characterClassName;
    private List<GemTypeDto> gemTypes;

    public GemClassDto(String characterClassName, List<GemTypeDto> gemTypes) {
        this.characterClassName = characterClassName;
        this.gemTypes = gemTypes;
    }
}
