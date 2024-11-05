package moaloa.store.back_end.exception;

import moaloa.store.back_end.exception.custom.CrawlingClickException;
import moaloa.store.back_end.exception.custom.CrawlingRunningException;
import moaloa.store.back_end.exception.custom.UserNotFoundException;
import moaloa.store.back_end.exception.custom.GemApiGetException;
import moaloa.store.back_end.exception.custom.GemDataException;
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
}
