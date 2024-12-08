package moaloa.store.back_end.exception;

import moaloa.store.back_end.exception.custom.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFoundException(UserNotFoundException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200); // OK
        response.put("errorCode", "USER_NOT_FOUND");
        response.put("message", e.getMessage());
        return ResponseEntity.ok(response);
    }
    @ExceptionHandler(CrawlingClickException.class)
    public ResponseEntity<Map<String, Object>> CrawlingClickException(CrawlingClickException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200); // OK
        response.put("errorCode", "CRAWLING_CLICK_ERROR");
        response.put("message", e.getMessage());
        return ResponseEntity.ok(response);
    }
    @ExceptionHandler(CrawlingRunningException.class)
    public ResponseEntity<Map<String, Object>> CrawlingRunningException(CrawlingRunningException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200); // OK
        response.put("errorCode", "CRAWLING_RUNNING_ERROR");
        response.put("message", e.getMessage());
        return ResponseEntity.ok(response);
    }
    @ExceptionHandler(GemApiGetException.class)
    public ResponseEntity<Map<String, Object>> GemApiGetException(GemApiGetException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200); // OK
        response.put("errorCode", "GEM_API_GET_ERROR");
        response.put("message", e.getMessage());
        return ResponseEntity.ok(response);
    }
    @ExceptionHandler(GemDataException.class)
    public ResponseEntity<Map<String, Object>> GemDataException(GemDataException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200); // OK
        response.put("errorCode", "GEM_DATA_ERROR");
        response.put("message", e.getMessage());
        return ResponseEntity.ok(response);
    }
    @ExceptionHandler(CraftApiGetException.class)
    public ResponseEntity<Map<String, Object>> CraftApiGetException(CraftApiGetException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200); // OK
        response.put("errorCode", "CRAFT_API_GET_ERROR");
        response.put("message", e.getMessage());
        return ResponseEntity.ok(response);
    }
    @ExceptionHandler(CraftDataException.class)
    public ResponseEntity<Map<String, Object>> CraftDataException(CraftDataException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200); // OK
        response.put("errorCode", "CRAFT_DATA_ERROR");
        response.put("message", e.getMessage());
        return ResponseEntity.ok(response);
    }
    @ExceptionHandler(GemPriceApiException.class)
    public ResponseEntity<Map<String, Object>> GemPriceApiException(GemPriceApiException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200); // OK
        response.put("errorCode", "GEM_PRICE_API_ERROR");
        response.put("message", e.getMessage());
        return ResponseEntity.ok(response);
    }
    @ExceptionHandler(RenewTradeCountException.class)
    public ResponseEntity<Map<String, Object>> renewTradeCountException(RenewTradeCountException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200); // OK
        response.put("errorCode", "RENEW_TRADE_COUNT_ERROR");
        response.put("message", e.getMessage());
        return ResponseEntity.ok(response);
    }
    @ExceptionHandler(GemAggregationException.class)
    public ResponseEntity<Map<String, Object>> GemAggregationException(GemAggregationException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200); // OK
        response.put("errorCode", "GEM_AGGREGATION_ERROR");
        response.put("message", e.getMessage());
        return ResponseEntity.ok(response);
    }
}
