package moaloa.store.back_end.craft;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api/v1/craft")
@RequiredArgsConstructor
public class CraftController {

    private final CraftService craftService;

    @GetMapping("/loaApi")
    public void getLoaApi() throws IOException {
        craftService.getLoaApi();
    }
}
