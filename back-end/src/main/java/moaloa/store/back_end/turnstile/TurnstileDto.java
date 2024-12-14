package moaloa.store.back_end.turnstile;


import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class TurnstileDto {
    private boolean success;
    private String[] errorCodes;

}
