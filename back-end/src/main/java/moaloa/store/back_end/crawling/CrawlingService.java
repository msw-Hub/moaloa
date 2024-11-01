package moaloa.store.back_end.crawling;

import lombok.RequiredArgsConstructor;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CrawlingService {

    public void crawlAndClick() {
        System.setProperty("webdriver.chrome.driver", "C://Users//swmoo//Downloads//chromedriver.exe"); // 여기에 실제 경로를 입력하세요.
        // WebDriver 인스턴스 생성
        WebDriver driver = new ChromeDriver();
        try {
            String url = "https://kloa.gg/characters";

            driver.get(url);

            System.out.println("페이지 제목: " + driver.getTitle());

            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

            // 직업 옵션 ID 배열 정의
            String[] jobOptionIds = {
                    "headlessui-listbox-option-:r8:", // 디트
                    "headlessui-listbox-option-:r9:", // 워로드
                    "headlessui-listbox-option-:ra:", // 버서커
                    "headlessui-listbox-option-:rb:", // 홀나
                    "headlessui-listbox-option-:rc:", // 슬레
                    "headlessui-listbox-option-:rd:", // 스커
                    "headlessui-listbox-option-:re:", // 브레이커
                    "headlessui-listbox-option-:rf:", // 배마
                    "headlessui-listbox-option-:rg:", // 인파
                    "headlessui-listbox-option-:rh:", // 기공사
                    "headlessui-listbox-option-:ri:", // 창술사
                    "headlessui-listbox-option-:rj:", // 데빌헌터
                    "headlessui-listbox-option-:rk:", // 블래스터
                    "headlessui-listbox-option-:rl:", // 호크아이
                    "headlessui-listbox-option-:rm:", // 스카우터
                    "headlessui-listbox-option-:rn:", // 건슬링어
                    "headlessui-listbox-option-:ro:", // 바드
                    "headlessui-listbox-option-:rp:", // 서머너
                    "headlessui-listbox-option-:rq:", // 아르카나
                    "headlessui-listbox-option-:rr:", // 소서리스
                    "headlessui-listbox-option-:rs:", // 블레이드
                    "headlessui-listbox-option-:rt:", // 데모닉
                    "headlessui-listbox-option-:ru:", // 리퍼
                    "headlessui-listbox-option-:rv:", // 소울이터
                    "headlessui-listbox-option-:r10:", // 도화가
                    "headlessui-listbox-option-:r11:"  // 기상술사
            };
            // 각인 옵션 ID 배열 정의
            String[] engraveOptionIds = {
                    "headlessui-listbox-option-:r13:", // 각인 옵션 1
                    "headlessui-listbox-option-:r17:", // 각인 옵션 2
                    // (필요한 각인 옵션 ID 추가)
            };

            // 각 직업 옵션 ID 순회하면서 클릭
            for (String jobId : jobOptionIds) {
                // 캐릭터 직업 선택 버튼 클릭 (전체 직업 버튼)
                WebElement firstButton = wait.until(ExpectedConditions.elementToBeClickable(By.id("headlessui-listbox-button-:r3:")));
                firstButton.click();
                wait.until(ExpectedConditions.attributeToBe(By.id("headlessui-listbox-button-:r3:"), "aria-expanded", "true"));
                Thread.sleep(1000); // 짧은 대기 추가

                // 각 직업 옵션 클릭
                WebElement jobOption = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id(jobId)));
                ((JavascriptExecutor) driver).executeScript("arguments[0].click();", jobOption);
                System.out.println("Clicked job option ID: " + jobId);
                Thread.sleep(1000); // 클릭 후 짧은 대기

                // 직업 각인 버튼 클릭
                WebElement engraveButton = wait.until(ExpectedConditions.elementToBeClickable(By.id("headlessui-listbox-button-:r5:")));
                engraveButton.click();
                wait.until(ExpectedConditions.attributeToBe(By.id("headlessui-listbox-button-:r5:"), "aria-expanded", "true"));
                Thread.sleep(2000); // 직업 각인 드롭다운 열림 대기
                printEngraveListBoxIds(driver);

                // 각 각인 옵션 ID 순회하며 클릭 후 정보 가져오기
                for (String engraveId : engraveOptionIds) {
                    try {
                        // 각인 옵션 클릭
                        WebElement engraveOption = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id(engraveId)));
                        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", engraveOption);
                        System.out.println("Clicked engrave option ID: " + engraveId);
                        Thread.sleep(2000); // 클릭 후 짧은 대기

                        // 선택된 각인에 대한 정보 가져오기
                        for (int i = 1; i <= 20; i++) {
                            String xpath = "//*[@id='content-container']/div/div/ul/li[" + i + "]/div/a";
                            try {
                                String name = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(xpath))).getText();
                                System.out.println("Info for engrave option " + engraveId + ": " + name);
                            } catch (Exception e) {
                                System.out.println("Element not found at index: " + i);
                            }
                        }

                        // 각인 정보 가져온 후 다시 직업 각인 버튼 열기
                        WebElement engraveButton2 = wait.until(ExpectedConditions.elementToBeClickable(By.id("headlessui-listbox-button-:r5:")));
                        engraveButton2.click();
                        wait.until(ExpectedConditions.attributeToBe(By.id("headlessui-listbox-button-:r5:"), "aria-expanded", "true"));
                        Thread.sleep(2000); // 직업 각인 드롭다운 열림 대기

                    } catch (TimeoutException e) {
                        System.out.println("Could not locate engrave option with ID: " + engraveId);
                    }
                }
                driver.navigate().refresh(); // 페이지 새로고침
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            driver.quit(); // 브라우저 종료
        }
    }
    // 위에서 작성한 메서드 추가
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

    public void scrawlAndClick() {
        System.setProperty("webdriver.chrome.driver", "C://Users//swmoo//Downloads//chromedriver.exe"); // 여기에 실제 경로를 입력하세요.

        // WebDriver 인스턴스 생성
        WebDriver driver = new ChromeDriver();
        try {
            String url = "https://www.google.com";
            driver.get(url);
            // 페이지 제목 출력
            System.out.println("페이지 제목: " + driver.getTitle());

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            driver.quit(); // 브라우저 종료
        }
    }
}
