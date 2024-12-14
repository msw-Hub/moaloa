package moaloa.store.back_end.turnstile;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/verify")
public class TurnstileController {

    private final TurnstileService turnstileService;

    @PostMapping("/turnstile")
    public ResponseEntity<?> verifyTurnstile(
            @RequestParam @NonNull String token
    ) {
        TurnstileDto response = turnstileService.verifyTurnstile(token);

        if (response != null && response.isSuccess()) {
            // 성공 시
            return ResponseEntity.ok().body("success");
        } else {
            // 실패 시
            return ResponseEntity.ok().body("fail");
        }
    }
}
