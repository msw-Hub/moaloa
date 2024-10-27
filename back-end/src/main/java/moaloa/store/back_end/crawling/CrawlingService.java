package moaloa.store.back_end.crawling;

import lombok.RequiredArgsConstructor;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
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

            // 캐릭터 직업 선택 버튼 클릭내용 -------------------------------------------------------------------------------------------------------------------------------
            // 첫 번째 버튼 클릭
            WebElement firstButton = wait.until(ExpectedConditions.elementToBeClickable(By.id("headlessui-listbox-button-:r3:")));
            firstButton.click();

            // 드롭다운 열림 대기
            wait.until(ExpectedConditions.attributeToBe(By.id("headlessui-listbox-button-:r3:"), "aria-expanded", "true"));

            String targetOptionId = "headlessui-listbox-option-:r8:"; // 클릭하고자 하는 옵션의 ID
            WebElement targetOption = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id(targetOptionId)));

            // JavaScript를 사용하여 클릭
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", targetOption);

            // 짧은 대기 추가
            Thread.sleep(1000); // 1초 대기

            // 직업 각인 선택 버튼 클릭내용 -------------------------------------------------------------------------------------------------------------------------------
            WebElement thirdButton = wait.until(ExpectedConditions.elementToBeClickable(By.id("headlessui-listbox-button-:r5:")));
            thirdButton.click();
            // 드롭다운 열림 대기
            wait.until(ExpectedConditions.attributeToBe(By.id("headlessui-listbox-button-:r5:"), "aria-expanded", "true"));

            // 리스트박스의 모든 옵션 요소를 가져오기
            List<WebElement> options = driver.findElements(By.xpath("//li[contains(@role, 'option')]")); // role이 option인 모든 li 요소 가져오기

            // 옵션의 id 속성 출력
            for (WebElement option : options) {
                String optionId = option.getAttribute("id"); // id 속성 추출
                System.out.println("옵션 ID: " + optionId);
            }

            String targetOptionId2 = "headlessui-listbox-option-:r13:"; // 클릭하고자 하는 옵션의 ID
            WebElement targetOption2 = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id(targetOptionId2)));
            // JavaScript를 사용하여 클릭
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", targetOption2);
            // 짧은 대기 추가
            Thread.sleep(1000); // 1초 대기

            // 선택된 요소 텍스트 가져오기
            String name = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//*[@id='content-container']/div/div/ul/li[1]/div/a"))).getText();
            System.out.println(name);

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            driver.quit(); // 브라우저 종료
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
