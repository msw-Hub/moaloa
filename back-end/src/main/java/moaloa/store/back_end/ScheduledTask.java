package moaloa.store.back_end;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import moaloa.store.back_end.craft.CraftService;
import moaloa.store.back_end.exception.custom.*;
import moaloa.store.back_end.gemSearch.crawling.CrawlingService;
import moaloa.store.back_end.gemSearch.gemApi.GemApiService;
import moaloa.store.back_end.gemSearch.gemData.GemDataService;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
@Slf4j
@EnableRetry
public class ScheduledTask {

    private final CrawlingService crawlingService;
    private final GemDataService gemDataService;
    private final GemApiService gemApiService;
    private final CraftService craftService;

    private boolean isRunning = false;

    // 생활재료 데이터 갱신
    @Async
    @Retryable(
            retryFor = {
                    CraftApiGetException.class, // API 요청 시 키 문제 또는 데이터 삽입 문제
                    CraftDataException.class
            },
            maxAttempts = 5,
            backoff = @Backoff(delay = 80000) // 1분 20초
    )
    @Scheduled(fixedDelay = 1000 * 60) // 1분
    public void renewCraftData() {
        if (isWithinBlockedTime()) {
            log.warn("renewCraftData is disabled on Wednesday between 6:00 and 10:00. Skipping this execution.");
            return;
        }

        if (isRunning) {
            log.warn("renewCraftData is already running. Skipping this execution.");
            return;
        }

        isRunning = true;
        try {
            log.info("======================CraftData Start======================");
            craftService.getLoaApi();
            log.info("======================CraftData End======================");
        } finally {
            isRunning = false;
        }
    }


    // 보석 시세 갱신
    @Async
    @Retryable(
            retryFor = {
                    GemDataException.class,  // json 파일 읽기, 쓰기, 파싱 문제 or 데이터베이스에 없는 보석일 경우
                    GemPriceApiException.class // 가격 요청 API 시 키 문제 또는 데이터 삽입 문제
            },
            maxAttempts = 5,
            backoff = @Backoff(delay = 80000) // 1분 20초
    )
    @Scheduled(fixedDelay = 1000 * 60 * 30) // 30분 (1000 = 1초)
    public void renewGemPrice() {
        if (isWithinBlockedTime()) {
            log.warn("renewGemPrice is disabled on Wednesday between 6:00 and 10:00. Skipping this execution.");
            return;
        }

        log.info("======================GemPrice Start======================");
        gemApiService.getGemPrice();
        log.info("======================GemPrice End======================");
    }

    // 제작아이템 거래량 갱신
    @Async
    @Retryable(
            retryFor = { RenewTradeCountException.class }, // API 요청 시 키 문제 또는 데이터 삽입 문제
            maxAttempts = 5,
            backoff = @Backoff(delay = 80000)
    )
    @Scheduled(cron = "0 5 0 * * ?") // 매일 0시 5분
    public void renewTradeCount() {
        if (isWithinBlockedTime()) {
            log.warn("renewTradeCount is disabled on Wednesday between 6:00 and 10:00. Skipping this execution.");
            return;
        }

        log.info("======================TradeCount Start======================");
        craftService.renewTradeCount();
        log.info("======================TradeCount End======================");
    }

    // 제한 시간 확인 메서드
    private boolean isWithinBlockedTime() {
        LocalDateTime now = LocalDateTime.now();
        DayOfWeek blockDay = DayOfWeek.WEDNESDAY;
        LocalTime startBlockTime = LocalTime.of(6, 0);
        LocalTime endBlockTime = LocalTime.of(10, 0);

        return now.getDayOfWeek() == blockDay &&
                !now.toLocalTime().isBefore(startBlockTime) && !now.toLocalTime().isAfter(endBlockTime);
    }


//    //크롤링하고 로아 API 호출해서 데이터 쌓음
//    @Async
//    @Scheduled(cron = "0 0 2 ? * FRI") // 매주 금요일 새벽 2시
//    public void crawlingAndGemApi() {
//        try {
//            // 1. 닉네임 크롤링
//            performCrawling();
//
//            // 2. 로아 API 호출
//            callLoaApi();
//
//            // 3. 직업 각인 데이터 크롤링
//            calculateEngraveRate();
//
//            // 4. 데이터 집계 및 저장
//            aggregateGemData();
//        } catch (Exception e) {
//            log.error("크롤링 및 API 호출 중 문제 발생", e);
//            throw e;
//        }
//    }
//    @Retryable(
//            retryFor = {
//                    CrawlingRunningException.class, // 클릭을 제외한 크롤링 중 문제 발생
//                    CrawlingClickException.class // 크롤링 클릭 중 문제 발생   >> 대부분은 클릭할 것을 못찾아서 발생
//            },
//            maxAttempts = 5,
//            backoff = @Backoff(delay = 30000) // 30초 후 재시도
//    )
//    private void performCrawling() {
//        log.info("======================Crawling Start======================");
//        crawlingService.crawlAndClick();
//        log.info("======================Crawling End======================");
//    }
//    @Retryable(
//            retryFor = {
//                    UserNotFoundException.class, // CrawlingEntity에 유저가 없을 때
//                    GemApiGetException.class // API 요청 중 문제 발생 >> 대부분은 로아측 서버 문제나 키 문제
//            },
//            maxAttempts = 5,
//            backoff = @Backoff(delay = 120000) // 2분 후 재시도
//    )
//    private void callLoaApi() {
//        log.info("======================LoaAPI Start======================");
//        gemApiService.loaAPI();
//        log.info("======================LoaAPI End======================");
//    }
//    @Retryable(
//            retryFor = { GemDataException.class }, // 클로아측 api 요청에 문제 발생 ( 데이터가 비었거나 내용이 변경된경우)
//            maxAttempts = 5,
//            backoff = @Backoff(delay = 30000) // 30초 후 재시도
//    )
//    private void calculateEngraveRate() {
//        log.info("======================EngraveRate Start======================");
//        gemDataService.engraveRate();
//        log.info("======================EngraveRate End======================");
//    }
//
//    @Retryable(
//            retryFor = { GemAggregationException.class }, // 집계 중 문제 발생 (db가 비었거나, json파일로 저장할때 문제 발생)
//            maxAttempts = 5,
//            backoff = @Backoff(delay = 30000) // 30초 후 재시도
//    )
//    private void aggregateGemData() {
//        log.info("======================AggregateGemData Start======================");
//        gemDataService.aggregateAndSaveGemData();
//        log.info("======================AggregateGemData End======================");
//    }
}
