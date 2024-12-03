package moaloa.store.back_end;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import moaloa.store.back_end.craft.CraftService;
import moaloa.store.back_end.exception.custom.CraftApiGetException;
import moaloa.store.back_end.exception.custom.CraftDataException;
import moaloa.store.back_end.exception.custom.GemApiGetException;
import moaloa.store.back_end.exception.custom.GemDataException;
import moaloa.store.back_end.gemSearch.crawling.CrawlingService;
import moaloa.store.back_end.gemSearch.gemApi.GemApiService;
import moaloa.store.back_end.gemSearch.gemData.GemDataService;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@EnableRetry
public class ScheduledTask {

    private final CrawlingService crawlingService;
    private final GemDataService gemDataService;
    private final GemApiService gemApiService;
    private final CraftService craftService;

    //첫실행은 순서를 넣어야함 + 복구로직 넣어야함 + 각각의 예외처리 알맞게 수정해야함

//    //제작아이템 시세 갱신
//    @Async
//    @Retryable(
//            retryFor = { CraftApiGetException.class, CraftDataException.class },
//            maxAttempts = 5,
//            backoff = @Backoff(delay = 60000)
//    )
//    @Scheduled(fixedDelay = 1000 * 60 ) // 1분 (1000 = 1초)
//    public void renewCraftData() {
//        log.info("CraftData Start");
//        craftService.getLoaApi();
//        log.info("CraftData End");
//    }
//
//    @Recover
//    public void recoverCraftApiGet(CraftApiGetException e) {
//        log.error("CraftApiGetException 발생: {}", e.getMessage());
//        //복구 로직 추가
//    }
//
//    @Recover
//    public void recoverCraftData(CraftDataException e) {
//        log.error("CraftDataException 발생: {}", e.getMessage());
//        //복구 로직 추가
//    }
//
//
//    //보석 시세 갱신
//    @Async
//    @Retryable(
//            retryFor = { GemDataException.class, GemApiGetException.class },
//            maxAttempts = 5,
//            backoff = @Backoff(delay = 60000)
//    )
//    @Scheduled(fixedDelay = 1000 * 60 * 30) // 30분 (1000 = 1초)
//    public void renewGemPrice() {
//        log.info("GemPrice Start");
//        gemApiService.getGemPrice();
//        log.info("GemPrice End");
//    }
//    @Recover
//    public void recoverGemData(GemDataException e) {
//        log.error("GemDataException 발생: {}", e.getMessage());
//        //복구 로직 추가
//    }
//    @Recover
//    public void recoverGemApiGet(GemApiGetException e) {
//        log.error("GemApiGetException 발생: {}", e.getMessage());
//        //복구 로직 추가
//    }
//
//
//    //제작아이템 거래량 갱신
//    @Async
//    @Scheduled(fixedDelay = 1000 * 60 * 60 * 24) // 1일 (1000 = 1초)
//    public void renewTradeCount() {
//        log.info("TradeCount Start");
//        craftService.renewTradeCount();
//        log.info("TradeCount End");
//    }
//
//    //크롤링하고 로아 API 호출해서 데이터 쌓음
//    @Async
//    @Scheduled(fixedDelay = 1000 * 60 * 60 * 24 * 7 ) // 1주일 (1000 = 1초)
//    public void crawlingAndGemApi() {
//        //상위 유저 닉네임 크롤링해서 저장
//        log.info("Crawling Start");
//        crawlingService.crawlAndClick();
//        log.info("Crawling End");
//
//        //상위 유저 닉네임 이용해서 로아 API 호출해서 보석 데이터 저장
//        log.info("loaApi Start");
//        gemApiService.loaAPI();
//        log.info("loaApi End");
//
//        //크롤링 한번 더 해서 상위 유저의 직업각인 데이터 쌓아서 가중치를 구함
//        log.info("engraveRate Start");
//        gemDataService.engraveRate();
//        log.info("engraveRate End");
//
//        //보석 데이터 집계(가중치계산) 및 저장
//        log.info("aggregateGemData Start");
//        gemDataService.aggregateAndSaveGemData();
//        log.info("aggregateGemData End");
//    }
}
