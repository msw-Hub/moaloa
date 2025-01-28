package moaloa.store.back_end.gemSearch.crawling;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import moaloa.store.back_end.exception.custom.CrawlingClickException;
import moaloa.store.back_end.exception.custom.CrawlingRunningException;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrawlingService {

    private final CrawlingRepository crawlingRepository;


    private Map<String, String> createJobMap() {
        Map<String, String> jobMap = new HashMap<>();
        jobMap.put("2", "디스트로이어");
        jobMap.put("3", "워로드");
        jobMap.put("4", "버서커");
        jobMap.put("5", "홀리나이트");
        jobMap.put("6", "슬레이어");
        jobMap.put("7", "스트라이커");
        jobMap.put("8", "브레이커");
        jobMap.put("9", "배틀마스터");
        jobMap.put("10", "인파이터");
        jobMap.put("11", "기공사");
        jobMap.put("12", "창술사");
        jobMap.put("13", "데빌헌터");
        jobMap.put("14", "블래스터");
        jobMap.put("15", "호크아이");
        jobMap.put("16", "스카우터");
        jobMap.put("17", "건슬링어");
        jobMap.put("18", "바드");
        jobMap.put("19", "서머너");
        jobMap.put("20", "아르카나");
        jobMap.put("21", "소서리스");
        jobMap.put("22", "블레이드");
        jobMap.put("23", "데모닉");
        jobMap.put("24", "리퍼");
        jobMap.put("25", "소울이터");
        jobMap.put("26", "도화가");
        jobMap.put("27", "기상술사");
        jobMap.put("28", "환수사");

        return jobMap;
    }
    private Map<String, Map<String, String>> createEngraveMap() {
        Map<String, Map<String, String>> engraveMap = new HashMap<>();

        Map<String, String> destroyerEngraves = new HashMap<>();
        destroyerEngraves.put("2", "분노의망치");
        destroyerEngraves.put("3", "중력수련");
        engraveMap.put("2", destroyerEngraves);

        Map<String, String> warlordEngraves = new HashMap<>();
        warlordEngraves.put("2", "고독한기사");
        warlordEngraves.put("3", "전투태세");
        engraveMap.put("3", warlordEngraves);

        Map<String, String> berserkerEngraves = new HashMap<>();
        berserkerEngraves.put("2", "광기");
        berserkerEngraves.put("3", "광전사의비기");
        engraveMap.put("4", berserkerEngraves);

        Map<String, String> holyKnightEngraves = new HashMap<>();
        holyKnightEngraves.put("2", "심판자");
        holyKnightEngraves.put("3", "축복의오라");
        engraveMap.put("5", holyKnightEngraves);

        Map<String, String> slayerEngraves = new HashMap<>();
        slayerEngraves.put("2", "처단자");
        slayerEngraves.put("3", "포식자");
        engraveMap.put("6", slayerEngraves);

        Map<String, String> strikerEngraves = new HashMap<>();
        strikerEngraves.put("2", "오의난무");
        strikerEngraves.put("3", "일격필살");
        engraveMap.put("7", strikerEngraves);

        Map<String, String> breakerEngraves = new HashMap<>();
        breakerEngraves.put("2", "권왕파천무");
        breakerEngraves.put("3", "수라의길");
        engraveMap.put("8", breakerEngraves);

        Map<String, String> battleMasterEngraves = new HashMap<>();
        battleMasterEngraves.put("2", "오의강화");
        battleMasterEngraves.put("3", "초심");
        engraveMap.put("9", battleMasterEngraves);

        Map<String, String> infighterEngraves = new HashMap<>();
        infighterEngraves.put("2", "체술");
        infighterEngraves.put("3", "충격단련");
        engraveMap.put("10", infighterEngraves);

        Map<String, String> soulMasterEngraves = new HashMap<>();
        soulMasterEngraves.put("2", "세맥타통");
        soulMasterEngraves.put("3", "역천지체");
        engraveMap.put("11", soulMasterEngraves);

        Map<String, String> spearMasterEngraves = new HashMap<>();
        spearMasterEngraves.put("2", "절정");
        spearMasterEngraves.put("3", "절제");
        engraveMap.put("12", spearMasterEngraves);

        Map<String, String> devilHunterEngraves = new HashMap<>();
        devilHunterEngraves.put("2", "강화무기");
        devilHunterEngraves.put("3", "핸드거너");
        engraveMap.put("13", devilHunterEngraves);

        Map<String, String> blasterEngraves = new HashMap<>();
        blasterEngraves.put("2", "포격강화");
        blasterEngraves.put("3", "화력강화");
        engraveMap.put("14", blasterEngraves);

        Map<String, String> hawkeyeEngraves = new HashMap<>();
        hawkeyeEngraves.put("2", "두번째동료");
        hawkeyeEngraves.put("3", "죽음의습격");
        engraveMap.put("15", hawkeyeEngraves);

        Map<String, String> scouterEngraves = new HashMap<>();
        scouterEngraves.put("2", "아르데타인의기술");
        scouterEngraves.put("3", "진화의유산");
        engraveMap.put("16", scouterEngraves);

        Map<String, String> gunslingerEngraves = new HashMap<>();
        gunslingerEngraves.put("2", "사냥의시간");
        gunslingerEngraves.put("3", "피스메이커");
        engraveMap.put("17", gunslingerEngraves);

        Map<String, String> bardEngraves = new HashMap<>();
        bardEngraves.put("2", "절실한구원");
        bardEngraves.put("3", "진실된용맹");
        engraveMap.put("18", bardEngraves);

        Map<String, String> summonerEngraves = new HashMap<>();
        summonerEngraves.put("2", "넘치는교감");
        summonerEngraves.put("3", "상급소환사");
        engraveMap.put("19", summonerEngraves);

        Map<String, String> arcanistEngraves = new HashMap<>();
        arcanistEngraves.put("2", "황제의칙령");
        arcanistEngraves.put("3", "황후의은총");
        engraveMap.put("20", arcanistEngraves);

        Map<String, String> sorceressEngraves = new HashMap<>();
        sorceressEngraves.put("2", "점화");
        sorceressEngraves.put("3", "환류");
        engraveMap.put("21", sorceressEngraves);

        Map<String, String> bladeEngraves = new HashMap<>();
        bladeEngraves.put("2", "버스트");
        bladeEngraves.put("3", "잔재된기운");
        engraveMap.put("22", bladeEngraves);

        Map<String, String> demonicEngraves = new HashMap<>();
        demonicEngraves.put("2", "멈출수없는충동");
        demonicEngraves.put("3", "완벽한억제");
        engraveMap.put("23", demonicEngraves);

        Map<String, String> reaperEngraves = new HashMap<>();
        reaperEngraves.put("2", "갈증");
        reaperEngraves.put("3", "달의소리");
        engraveMap.put("24", reaperEngraves);

        Map<String, String> souliterEngraves = new HashMap<>();
        souliterEngraves.put("2", "만월의집행자");
        souliterEngraves.put("3", "그믐의경계");
        engraveMap.put("25", souliterEngraves);

        Map<String, String> painterEngraves = new HashMap<>();
        painterEngraves.put("2", "만개");
        painterEngraves.put("3", "회귀");
        engraveMap.put("26", painterEngraves);

        Map<String, String> weatherEngraves = new HashMap<>();
        weatherEngraves.put("2", "이슬비");
        weatherEngraves.put("3", "질풍술사");
        engraveMap.put("27", weatherEngraves);

        Map<String, String> hwansusaEngraves = new HashMap<>();
        hwansusaEngraves.put("2", "야성");
        hwansusaEngraves.put("3", "환수각성");
        engraveMap.put("28", hwansusaEngraves);

        return engraveMap;
    }

    @Transactional
    public void crawlAndClick() {
        System.setProperty("webdriver.chrome.driver", "C:/Temp/chromedriver.exe"); // 여기에 실제 경로를 입력하세요.
        // WebDriver 인스턴스 생성
        ChromeOptions options = new ChromeOptions();

        WebDriver driver = new ChromeDriver(options);
        try {
            String url = "https://kloa.gg/characters";
            driver.get(url);

            // 웹드라이버 인스턴스 생성(최대 10초 대기)
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

            // 직업 순서를 명시적으로 정의
            String[] orderedJobIds = {
                    "2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28"
            };
            // 각인 옵션 ID 배열 정의
            String[] engraveOptionIds = {
                    "2", "3",
            };

            // 직업과 각인 매핑 생성
            Map<String, String> jobMap = createJobMap();
            Map<String, Map<String, String>> engraveMap = createEngraveMap();

            // 기존 데이터를 비우기 (삭제)
            crawlingRepository.deleteAll(); // 기존 데이터를 삭제합니다.

            // 직업에 대해 반복
            for (String jobId : orderedJobIds) {
                String jobName = jobMap.get(jobId);

                log.info("Processing job: {} ({})", jobName, jobId);

                // 직업 버튼 클릭
                clickJobButton(jobId,driver,wait);
                log.info("Clicked job: {} ({})", jobName, jobId);



                // 현재 직업에 맞는 각인 Map 가져오기
                Map<String, String> currentEngraveMap = engraveMap.get(jobId);

                // 직업 각인 옵션에 대해 반복 (2가지)
                for (String engraveId : engraveOptionIds) {
                    String engraveName = currentEngraveMap.get(engraveId);

                    // 각인 버튼 클릭
                    clickEngraveButton(engraveId,driver,wait);
                    log.info("Clicked engrave: {} ({})", engraveName, engraveId);
                    Thread.sleep(4000); // 클릭 후 대기 (화면 로딩)

                    String checkJobName = wait.until(ExpectedConditions.visibilityOfElementLocated(
                            By.xpath("//*[@id='content-container']/div/div/ul/li[1]/div/p[3]"))).getText();

                    // 직업이 일치하지 않으면 재시도
                    int retryCount = 0;
                    while (!jobName.equals(checkJobName) && retryCount < 3) {
                        log.warn("직업이 일치하지 않습니다. 재시도 중... ({} != {})", jobName, checkJobName);
                        driver.navigate().refresh(); // 새로고침
                        clickJobButton(jobId,driver,wait); // 다시 직업 버튼 클릭
                        if (engraveId.equals("2")) {  //앞쪽 직업각인 문제면 다시 클릭
                            clickEngraveButton(engraveId, driver, wait); // 다시 각인 버튼 클릭
                        }
                        else if (engraveId.equals("3")) { //뒷쪽 직업각인 문제면 앞선 직업각인 클릭 후 다시 클릭
                            clickEngraveButton("2", driver, wait); // 앞쪽 각인 버튼 클릭
                            clickEngraveButton(engraveId,driver,wait); // 다시 각인 버튼 클릭
                        }
                        Thread.sleep(4000); // 클릭 후 대기 (화면 로딩)

                        checkJobName = wait.until(ExpectedConditions.visibilityOfElementLocated(
                                By.xpath("//*[@id='content-container']/div/div/ul/li[1]/div/p[3]"))).getText();
                        retryCount++;
                    }
                    if (!jobName.equals(checkJobName)) {
                        log.error("직업이 일치하지 않아 크롤링을 중단합니다. ({} != {})", jobName, checkJobName);
                        throw new CrawlingRunningException("크롤링 중 해당 직업페이지가 지속적으로 로딩되지 않아 크롤링에 실패하였습니다 : " + jobName);
                    }

                    // 상위 50명의 닉네임 db에 저장
                    int crawlingCount = 50;
                    for (int i = 1; i <= crawlingCount; i++) {
                        // 닉네임이 위치한 XPath
                        String xpath = "//*[@id='content-container']/div/div/ul/li[" + i + "]/div/a";


                        // 닉네임 텍스트를 가져옴
                        String name = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(xpath))).getText();

                        // DB에 저장
                        CrawlingEntity entity = new CrawlingEntity();
                        entity.setCharacterClassName(jobName);
                        entity.setEngraveName(engraveName);
                        entity.setUserNickName(name);
                        crawlingRepository.save(entity);
                    }
                }
                driver.navigate().refresh(); // 페이지 새로고침
            }
        } catch (InterruptedException e) {
            throw new CrawlingRunningException("크롤링 중 에러가 발생하였습니다");
        } finally {
            // 브라우저 닫기
            driver.quit();
        }
    }

    public void clickJobButton(String jobId,WebDriver driver,WebDriverWait wait) {
        try {
            // [전체] 직업 버튼 클릭 대기 (찾는중)
            WebElement firstButton = driver.findElement(By.xpath("/html/body/div[1]/div[1]/div/div/div[3]/div[1]/div[2]/button"));
            waitForElementToBeClickable(driver, firstButton);
            firstButton.click(); // 첫 번째 버튼 클릭
            Thread.sleep(1000);

            // 두 번째 리스트박스 옵션 클릭 (주어진 XPath로 클릭)
            WebElement secondOption = driver.findElement(By.xpath("/html/body/div/div[1]/div/div/div[3]/div[1]/div[2]/ul/div/li[" + jobId + "]"));
            waitForElementToBeClickable(driver, secondOption); // 클릭 가능할 때까지 기다림
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", secondOption); // JavaScript로 클릭

        } catch (NoSuchElementException e) {
            throw new CrawlingClickException("크롤링 중 클릭할 것을 찾지 못하였습니다");
        } catch (Exception e) {
            throw new CrawlingClickException("크롤링 중 직업 버튼을 클릭에 실패하였습니다");
        }
    }

    public void clickEngraveButton(String engraveId,WebDriver driver,WebDriverWait wait){
        try {
            // [전체] 각인 버튼 클릭 대기 (찾는중)
            WebElement secondButton = driver.findElement(By.xpath("/html/body/div/div[1]/div/div/div[3]/div[1]/div[3]/button"));
            waitForElementToBeClickable(driver, secondButton);
            secondButton.click(); // 두 번째 버튼 클릭
            Thread.sleep(1000); // 두 번째 리스트박스가 렌더링 될 시간을 기다림

            // 두 번째 리스트박스 옵션 클릭 (주어진 XPath로 클릭)
            WebElement secondOption = driver.findElement(By.xpath("/html/body/div/div[1]/div/div/div[3]/div[1]/div[3]/ul/div/li[" + engraveId + "]"));
            waitForElementToBeClickable(driver, secondOption); // 클릭 가능할 때까지 기다림
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", secondOption); // JavaScript로 클릭

        } catch (NoSuchElementException e) {
            throw new CrawlingClickException("크롤링 중 클릭할 것을 찾지 못하였습니다");
        } catch (Exception e) {
            throw new CrawlingClickException("크롤링 중 직업각인 버튼을 클릭에 실패하였습니다");
        }
    }


    public void findId() {
        System.setProperty("webdriver.chrome.driver", "C:/Temp/chromedriver.exe");
        ChromeOptions options = new ChromeOptions();
        WebDriver driver = new ChromeDriver(options);
        try {
            // 웹 페이지 열기
            driver.get("https://kloa.gg/characters");

            // 첫 번째 버튼 클릭: 주어진 XPath로 첫 번째 버튼 클릭
            WebElement firstButton = driver.findElement(By.xpath("/html/body/div[1]/div[1]/div/div/div[3]/div[1]/div[2]/button"));
            waitForElementToBeClickable(driver, firstButton);
            firstButton.click(); // 첫 번째 버튼 클릭
            Thread.sleep(1000); // 리스트박스가 렌더링 될 시간을 기다림

            // 첫 번째 리스트박스의 id값들을 가져오기
            printEngraveListBoxIds(driver); // 첫 번째 리스트박스 내 id값을 출력하는 메서드 호출

            //리스트박스의 버튼중 하나를 누르는 매서드 필요
            // 2번 버튼을 클릭하는 로직
            try {
                // 두 번째 리스트박스 옵션 클릭 (주어진 XPath로 클릭)
                WebElement secondOption = driver.findElement(By.xpath("/html/body/div/div[1]/div/div/div[3]/div[1]/div[2]/ul/div/li[2]"));
                waitForElementToBeClickable(driver, secondOption); // 클릭 가능할 때까지 기다림
                ((JavascriptExecutor) driver).executeScript("arguments[0].click();", secondOption); // JavaScript로 클릭
                Thread.sleep(500); // 클릭 후 잠시 대기
            } catch (Exception e) {
                e.printStackTrace();
            }

            // 3. 두 번째 버튼 클릭: 주어진 XPath로 두 번째 버튼 클릭
            WebElement secondButton = driver.findElement(By.xpath("/html/body/div/div[1]/div/div/div[3]/div[1]/div[3]/button"));
            waitForElementToBeClickable(driver, secondButton);
            secondButton.click(); // 두 번째 버튼 클릭
            Thread.sleep(1000); // 두 번째 리스트박스가 렌더링 될 시간을 기다림

            log.info("두 번째 리스트박스 출력 중...");
            // 두 번째 리스트박스의 id값들을 가져오기
            printEngraveListBoxIds(driver); // 두 번째 리스트박스 내 id값을 출력하는 메서드 호출

        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            driver.quit();
        }
    }

    public void printEngraveListBoxIds(WebDriver driver) {
        // 리스트 박스를 나타내는 XPath로 변경
        List<WebElement> listBoxes = driver.findElements(By.xpath("//ul[@role='listbox']//li"));

        // 리스트박스 아이템들의 id를 출력
        for (WebElement listBox : listBoxes) {
            String id = listBox.getAttribute("id");
            if (id != null && id.startsWith("headlessui-listbox-option-")) {
                System.out.println("List Box ID: " + id);
            }
        }
    }
    public void waitForElementToBeClickable(WebDriver driver, WebElement element) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.elementToBeClickable(element));
    }
}