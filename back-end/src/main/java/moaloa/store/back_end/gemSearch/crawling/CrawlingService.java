package moaloa.store.back_end.gemSearch.crawling;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import moaloa.store.back_end.exception.custom.ClawlingClickException;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;

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
        jobMap.put("headlessui-listbox-option-:r8:", "디스트로이어");
        jobMap.put("headlessui-listbox-option-:r9:", "워로드");
        jobMap.put("headlessui-listbox-option-:ra:", "버서커");
        jobMap.put("headlessui-listbox-option-:rb:", "홀리나이트");
        jobMap.put("headlessui-listbox-option-:rc:", "슬레이어");
        jobMap.put("headlessui-listbox-option-:rd:", "스트라이커");
        jobMap.put("headlessui-listbox-option-:re:", "브레이커");
        jobMap.put("headlessui-listbox-option-:rf:", "배틀마스터");
        jobMap.put("headlessui-listbox-option-:rg:", "인파이터");
        jobMap.put("headlessui-listbox-option-:rh:", "기공사");
        jobMap.put("headlessui-listbox-option-:ri:", "창술사");
        jobMap.put("headlessui-listbox-option-:rj:", "데빌헌터");
        jobMap.put("headlessui-listbox-option-:rk:", "블래스터");
        jobMap.put("headlessui-listbox-option-:rl:", "호크아이");
        jobMap.put("headlessui-listbox-option-:rm:", "스카우터");
        jobMap.put("headlessui-listbox-option-:rn:", "건슬링어");
        jobMap.put("headlessui-listbox-option-:ro:", "바드");
        jobMap.put("headlessui-listbox-option-:rp:", "서머너");
        jobMap.put("headlessui-listbox-option-:rq:", "아르카나");
        jobMap.put("headlessui-listbox-option-:rr:", "소서리스");
        jobMap.put("headlessui-listbox-option-:rs:", "블레이드");
        jobMap.put("headlessui-listbox-option-:rt:", "데모닉");
        jobMap.put("headlessui-listbox-option-:ru:", "리퍼");
        jobMap.put("headlessui-listbox-option-:rv:", "소울이터");
        jobMap.put("headlessui-listbox-option-:r10:", "도화가");
        jobMap.put("headlessui-listbox-option-:r11:", "기상술사");
        return jobMap;
    }
    private Map<String, Map<String, String>> createEngraveMap() {
        Map<String, Map<String, String>> engraveMap = new HashMap<>();

        Map<String, String> destroyerEngraves = new HashMap<>();
        destroyerEngraves.put("headlessui-listbox-option-:r13:", "분노의망치");
        destroyerEngraves.put("headlessui-listbox-option-:r17:", "중력수련");
        engraveMap.put("headlessui-listbox-option-:r8:", destroyerEngraves);

        Map<String, String> warlordEngraves = new HashMap<>();
        warlordEngraves.put("headlessui-listbox-option-:r13:", "고독한기사");
        warlordEngraves.put("headlessui-listbox-option-:r17:", "전투태세");
        engraveMap.put("headlessui-listbox-option-:r9:", warlordEngraves);

        Map<String, String> berserkerEngraves = new HashMap<>();
        berserkerEngraves.put("headlessui-listbox-option-:r13:", "광기");
        berserkerEngraves.put("headlessui-listbox-option-:r17:", "광전사의비기");
        engraveMap.put("headlessui-listbox-option-:ra:", berserkerEngraves);

        Map<String, String> holyKnightEngraves = new HashMap<>();
        holyKnightEngraves.put("headlessui-listbox-option-:r13:", "심판자");
        holyKnightEngraves.put("headlessui-listbox-option-:r17:", "축복의오라");
        engraveMap.put("headlessui-listbox-option-:rb:", holyKnightEngraves);

        Map<String, String> slayerEngraves = new HashMap<>();
        slayerEngraves.put("headlessui-listbox-option-:r13:", "처단자");
        slayerEngraves.put("headlessui-listbox-option-:r17:", "포식자");
        engraveMap.put("headlessui-listbox-option-:rc:", slayerEngraves);

        Map<String, String> strikerEngraves = new HashMap<>();
        strikerEngraves.put("headlessui-listbox-option-:r13:", "오의난무");
        strikerEngraves.put("headlessui-listbox-option-:r17:", "일격필살");
        engraveMap.put("headlessui-listbox-option-:rd:", strikerEngraves);

        Map<String, String> breakerEngraves = new HashMap<>();
        breakerEngraves.put("headlessui-listbox-option-:r13:", "권왕파천무");
        breakerEngraves.put("headlessui-listbox-option-:r17:", "수라의길");
        engraveMap.put("headlessui-listbox-option-:re:", breakerEngraves);

        Map<String, String> battleMasterEngraves = new HashMap<>();
        battleMasterEngraves.put("headlessui-listbox-option-:r13:", "오의강화");
        battleMasterEngraves.put("headlessui-listbox-option-:r17:", "초심");
        engraveMap.put("headlessui-listbox-option-:rf:", battleMasterEngraves);

        Map<String, String> infighterEngraves = new HashMap<>();
        infighterEngraves.put("headlessui-listbox-option-:r13:", "체술");
        infighterEngraves.put("headlessui-listbox-option-:r17:", "충격단련");
        engraveMap.put("headlessui-listbox-option-:rg:", infighterEngraves);

        Map<String, String> soulMasterEngraves = new HashMap<>();
        soulMasterEngraves.put("headlessui-listbox-option-:r13:", "세맥타통");
        soulMasterEngraves.put("headlessui-listbox-option-:r17:", "역천지체");
        engraveMap.put("headlessui-listbox-option-:rh:", soulMasterEngraves);

        Map<String, String> spearMasterEngraves = new HashMap<>();
        spearMasterEngraves.put("headlessui-listbox-option-:r13:", "절정");
        spearMasterEngraves.put("headlessui-listbox-option-:r17:", "절제");
        engraveMap.put("headlessui-listbox-option-:ri:", spearMasterEngraves);

        Map<String, String> devilHunterEngraves = new HashMap<>();
        devilHunterEngraves.put("headlessui-listbox-option-:r13:", "강화무기");
        devilHunterEngraves.put("headlessui-listbox-option-:r17:", "핸드거너");
        engraveMap.put("headlessui-listbox-option-:rj:", devilHunterEngraves);

        Map<String, String> blasterEngraves = new HashMap<>();
        blasterEngraves.put("headlessui-listbox-option-:r13:", "포격강화");
        blasterEngraves.put("headlessui-listbox-option-:r17:", "화력강화");
        engraveMap.put("headlessui-listbox-option-:rk:", blasterEngraves);

        Map<String, String> hawkeyeEngraves = new HashMap<>();
        hawkeyeEngraves.put("headlessui-listbox-option-:r13:", "두번째동료");
        hawkeyeEngraves.put("headlessui-listbox-option-:r17:", "죽음의습격");
        engraveMap.put("headlessui-listbox-option-:rl:", hawkeyeEngraves);

        Map<String, String> scouterEngraves = new HashMap<>();
        scouterEngraves.put("headlessui-listbox-option-:r13:", "아르데타인의기술");
        scouterEngraves.put("headlessui-listbox-option-:r17:", "진화의유산");
        engraveMap.put("headlessui-listbox-option-:rm:", scouterEngraves);

        Map<String, String> gunslingerEngraves = new HashMap<>();
        gunslingerEngraves.put("headlessui-listbox-option-:r13:", "사냥의시간");
        gunslingerEngraves.put("headlessui-listbox-option-:r17:", "피스메이커");
        engraveMap.put("headlessui-listbox-option-:rn:", gunslingerEngraves);

        Map<String, String> bardEngraves = new HashMap<>();
        bardEngraves.put("headlessui-listbox-option-:r13:", "절실한구원");
        bardEngraves.put("headlessui-listbox-option-:r17:", "진실된용맹");
        engraveMap.put("headlessui-listbox-option-:ro:", bardEngraves);

        Map<String, String> summonerEngraves = new HashMap<>();
        summonerEngraves.put("headlessui-listbox-option-:r13:", "넘치는교감");
        summonerEngraves.put("headlessui-listbox-option-:r17:", "상급소환사");
        engraveMap.put("headlessui-listbox-option-:rp:", summonerEngraves);

        Map<String, String> arcanistEngraves = new HashMap<>();
        arcanistEngraves.put("headlessui-listbox-option-:r13:", "황제의칙령");
        arcanistEngraves.put("headlessui-listbox-option-:r17:", "황후의은총");
        engraveMap.put("headlessui-listbox-option-:rq:", arcanistEngraves);

        Map<String, String> sorceressEngraves = new HashMap<>();
        sorceressEngraves.put("headlessui-listbox-option-:r13:", "점화");
        sorceressEngraves.put("headlessui-listbox-option-:r17:", "환류");
        engraveMap.put("headlessui-listbox-option-:rr:", sorceressEngraves);

        Map<String, String> bladeEngraves = new HashMap<>();
        bladeEngraves.put("headlessui-listbox-option-:r13:", "버스트");
        bladeEngraves.put("headlessui-listbox-option-:r17:", "잔재된기운");
        engraveMap.put("headlessui-listbox-option-:rs:", bladeEngraves);

        Map<String, String> demonicEngraves = new HashMap<>();
        demonicEngraves.put("headlessui-listbox-option-:r13:", "멈출수없는충동");
        demonicEngraves.put("headlessui-listbox-option-:r17:", "완벽한억제");
        engraveMap.put("headlessui-listbox-option-:rt:", demonicEngraves);

        Map<String, String> reaperEngraves = new HashMap<>();
        reaperEngraves.put("headlessui-listbox-option-:r13:", "갈증");
        reaperEngraves.put("headlessui-listbox-option-:r17:", "달의소리");
        engraveMap.put("headlessui-listbox-option-:ru:", reaperEngraves);

        Map<String, String> souliterEngraves = new HashMap<>();
        souliterEngraves.put("headlessui-listbox-option-:r13:", "만월의집행자");
        souliterEngraves.put("headlessui-listbox-option-:r17:", "그믐의경계");
        engraveMap.put("headlessui-listbox-option-:rv:", souliterEngraves);

        Map<String, String> painterEngraves = new HashMap<>();
        painterEngraves.put("headlessui-listbox-option-:r13:", "만개");
        painterEngraves.put("headlessui-listbox-option-:r17:", "회귀");
        engraveMap.put("headlessui-listbox-option-:r10:", painterEngraves);

        Map<String, String> weatherEngraves = new HashMap<>();
        weatherEngraves.put("headlessui-listbox-option-:r13:", "이슬비");
        weatherEngraves.put("headlessui-listbox-option-:r17:", "질풍술사");
        engraveMap.put("headlessui-listbox-option-:r11:", weatherEngraves);

        return engraveMap;
    }

    public void crawlAndClick() {
        System.setProperty("webdriver.chrome.driver", "C://Users//swmoo//Downloads//chromedriver.exe"); // 여기에 실제 경로를 입력하세요.
        // WebDriver 인스턴스 생성
        WebDriver driver = new ChromeDriver();
        try {
            String url = "https://kloa.gg/characters";
            driver.get(url);

            // 웹드라이버 인스턴스 생성(최대 10초 대기)
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

            // 직업 순서를 명시적으로 정의
            String[] orderedJobIds = {
                    "headlessui-listbox-option-:r8:", "headlessui-listbox-option-:r9:", "headlessui-listbox-option-:ra:", "headlessui-listbox-option-:rb:", "headlessui-listbox-option-:rc:", "headlessui-listbox-option-:rd:", "headlessui-listbox-option-:re:", "headlessui-listbox-option-:rf:", "headlessui-listbox-option-:rg:", "headlessui-listbox-option-:rh:", "headlessui-listbox-option-:ri:", "headlessui-listbox-option-:rj:", "headlessui-listbox-option-:rk:", "headlessui-listbox-option-:rl:", "headlessui-listbox-option-:rm:", "headlessui-listbox-option-:rn:", "headlessui-listbox-option-:ro:", "headlessui-listbox-option-:rp:", "headlessui-listbox-option-:rq:", "headlessui-listbox-option-:rr:", "headlessui-listbox-option-:rs:", "headlessui-listbox-option-:rt:", "headlessui-listbox-option-:ru:", "headlessui-listbox-option-:rv:", "headlessui-listbox-option-:r10:", "headlessui-listbox-option-:r11:"
            };
            // 각인 옵션 ID 배열 정의
            String[] engraveOptionIds = {
                    "headlessui-listbox-option-:r13:", "headlessui-listbox-option-:r17:",
            };

            // 직업과 각인 매핑 생성
            Map<String, String> jobMap = createJobMap();
            Map<String, Map<String, String>> engraveMap = createEngraveMap();

            // 직업에 대해 반복
            for (String jobId : orderedJobIds) {
                String jobName = jobMap.get(jobId);

                if (jobName == null) {
                    log.error("No job name found for ID: {}", jobId);
                    continue;
                }
                log.info("Processing job: {} ({})", jobName, jobId);

                // 직업 버튼 클릭
                clickJobButton(jobId,driver,wait);


                // 현재 직업에 맞는 각인 Map 가져오기
                Map<String, String> currentEngraveMap = engraveMap.get(jobId);

                // 직업 각인 옵션에 대해 반복 (2가지)
                for (String engraveId : engraveOptionIds) {
                    String engraveName = currentEngraveMap.get(engraveId);

                    // 각인 버튼 클릭
                    clickEngraveButton(engraveId,driver,wait);
                    Thread.sleep(3000); // 클릭 후 2초 대기 (화면 로딩)

                    // 상위 20명의 닉네임 db에 저장
                    for (int i = 1; i <= 20; i++) {
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
            throw new RuntimeException(e);
        } finally {
            // 브라우저 닫기
            driver.quit();
        }
    }
    public void clickJobButton(String jobId,WebDriver driver,WebDriverWait wait) {
        try {
            // [전체] 직업 버튼 클릭 대기 (찾는중)
            WebElement firstButton = wait.until(ExpectedConditions.elementToBeClickable(By.id("headlessui-listbox-button-:r3:")));
            firstButton.click(); // [전체] 직업 버튼 클릭
            // 버튼이 확장될 때까지 대기
            wait.until(ExpectedConditions.attributeToBe(By.id("headlessui-listbox-button-:r3:"), "aria-expanded", "true"));
            // [특정 직업] 버튼 클릭 대기 - ID로 찾기 + 보일때까지 대기
            WebElement jobOption = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id(jobId)));
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", jobOption); // javascript로 클릭
        } catch (ClawlingClickException e) {
            System.out.println("Timeout while trying to click the job button: " + e.getMessage());
        }
    }
    public void clickEngraveButton(String engraveId,WebDriver driver,WebDriverWait wait){
        try {
            // [전체] 각인 버튼 클릭 대기 (찾는중)
            WebElement engraveButton = wait.until(ExpectedConditions.elementToBeClickable(By.id("headlessui-listbox-button-:r5:")));
            engraveButton.click(); // [전체] 각인 버튼 클릭
            wait.until(ExpectedConditions.attributeToBe(By.id("headlessui-listbox-button-:r5:"), "aria-expanded", "true")); // 버튼이 확장될 때까지 대기

            // [특정 각인] 버튼 클릭 대기 (찾는중)
            WebElement engraveOption = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id(engraveId)));
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", engraveOption);    // javascript로 클릭
        } catch (ClawlingClickException e) {
            System.out.println("Timeout while trying to click the engrave button: " + e.getMessage());
        }
    }

    //id속성 찾기 위한 메서드
    public void printEngraveListBoxIds(WebDriver driver) {
        // 리스트 박스를 나타내는 XPath (고유한 XPath로 수정 필요)
        List<WebElement> listBoxes = driver.findElements(By.xpath("//ul[@role='listbox']//li"));

        for (WebElement listBox : listBoxes) {
            String id = listBox.getAttribute("id");
            if (id != null && id.startsWith("headlessui-listbox-option-")) {
                System.out.println("List Box ID: " + id);
            }
        }
    }
}