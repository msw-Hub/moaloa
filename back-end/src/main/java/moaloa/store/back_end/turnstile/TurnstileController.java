package moaloa.store.back_end.turnstile;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/verify-turnstile")
public class TurnstileController {

    private final TurnstileService turnstileService;

    @PostMapping("")
    public ResponseEntity<?> verifyTurnstile(
            @RequestParam @NonNull String token,
            @RequestParam @NonNull String remoteIp
    ) {
        TurnstileDto response = turnstileService.verifyTurnstile(token, remoteIp);

        if (response != null && response.isSuccess()) {
            // 성공 시
            return ResponseEntity.ok().body("success");
        } else {
            // 실패 시
            return ResponseEntity.ok().body("fail");
        }
    }
}
