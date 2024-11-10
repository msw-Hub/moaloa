//package moaloa.store.back_end.gemSearch;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import moaloa.store.back_end.gemSearch.crawling.CrawlingService;
//import moaloa.store.back_end.gemSearch.gemApi.GemApiService;
//import moaloa.store.back_end.gemSearch.gemData.GemDataService;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Service;
//
//@Slf4j
//@Service
//@RequiredArgsConstructor
//public class ScheduledTasks {
//
//    private final CrawlingService crawlingService;
//    private final GemApiService gemApiService;
//    private final GemDataService gemDataService;
//
//    @Scheduled(cron = "0 0 3 * * THU") // 매주 목요일 새벽 3시 자동 실행
//    public void performWeeklyUpdate() {
//        log.info("=================================================================");
//        log.info("주간 업데이트 시작");
//        log.info("=================================================================");
//        log.info("크롤링 시작");
//        crawlingService.crawlAndClick();
//        log.info("=================================================================");
//        log.info("크롤링 완료 및 API 호출 시작");
//        gemApiService.loaAPI();
//        log.info("=================================================================");
//        log.info("API 호출 완료 및 데이터 집계 시작");
//        gemDataService.aggregateAndSaveGemData();
//    }
//}
