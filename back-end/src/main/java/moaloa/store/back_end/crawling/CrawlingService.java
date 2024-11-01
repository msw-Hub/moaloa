package moaloa.store.back_end.crawling;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrawlingService {

    private final CrawlingRepository crawlingRepository;

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

                                // db저장
                                String characterClassName = null;
                                String engraveName = null;

                                if(jobId.equals("headlessui-listbox-option-:r8:")) {
                                    characterClassName = "디스트로이어";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "분노의망치";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "중력수련";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:r9:")) {
                                    characterClassName = "워로드";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "고독한기사";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "전투태세";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:ra:")) {
                                    characterClassName = "버서커";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "광기";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "광전사의비기";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rb:")) {
                                    characterClassName = "홀리나이트";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "심판자";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "축복의오라";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rc:")) {
                                    characterClassName = "슬레이어";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "처단자";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "포식자";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rd:")) {
                                    characterClassName = "스트라이커";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "오의난무";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "일격필살";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:re:")) {
                                    characterClassName = "브레이커";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "권왕파천무";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "수라의길";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rf:")) {
                                    characterClassName = "배틀마스터";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "오의강화";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "초심";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rg:")) {
                                    characterClassName = "인파이터";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "체술";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "충격단련";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rh:")) {
                                    characterClassName = "기공사";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "세맥타통";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "역천지체";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:ri:")) {
                                    characterClassName = "기공사";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "절정";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "절제";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rj:")) {
                                    characterClassName = "데빌헌터";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "강화무기";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "핸드거너";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rk:")) {
                                    characterClassName = "블래스터";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "포격강화";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "화력강화";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rl:")) {
                                    characterClassName = "호크아이";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "두번째동료";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "죽음의습격";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rm:")) {
                                    characterClassName = "스카우터";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "아르데타인의기술";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "진화의유산";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rn:")) {
                                    characterClassName = "건슬링어";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "사냥의시간";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "피스메이커";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:ro:")) {
                                    characterClassName = "바드";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "절실한구원";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "진실된용맹";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rp:")) {
                                    characterClassName = "서머너";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "넘치는교감";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "상급소환사";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rq:")) {
                                    characterClassName = "아르카나";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "황제의칙령";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "황후의은총";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rr:")) {
                                    characterClassName = "소서리스";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "점화";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "환류";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rs:")) {
                                    characterClassName = "블레이드";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "버스트";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "잔재된기운";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rt:")) {
                                    characterClassName = "데모닉";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "멈출수없는충동";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "완벽한억제";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:ru:")) {
                                    characterClassName = "리퍼";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "갈증";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "달의소리";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:rv:")) {
                                    characterClassName = "소울이터";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "만월의집행자";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "그믐의경계";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:r10:")) {
                                    characterClassName = "도화가";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "만개";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "회귀";
                                    }
                                } else if (jobId.equals("headlessui-listbox-option-:r11:")) {
                                    characterClassName = "기상술사";
                                    if (engraveId.equals("headlessui-listbox-option-:r13:")) {
                                        engraveName = "이슬비";
                                    } else if (engraveId.equals("headlessui-listbox-option-:r17:")) {
                                        engraveName = "질풍술사";
                                    }
                                }

                                CrawlingEntity entity = new CrawlingEntity();
                                entity.setCharacterClassName(characterClassName);
                                entity.setEngraveName(engraveName);
                                entity.setUserNickName(name);
                                crawlingRepository.save(entity);

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
    public void loaAPI(String api, String userNickName) throws IOException {
        String endpoint = "/armories/characters/" + userNickName + "/gems";
        URL url = new URL("https://developer-lostark.game.onstove.com" + endpoint);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();

        connection.setRequestMethod("GET");
        connection.setRequestProperty("Authorization", "bearer " + api);
        connection.setRequestProperty("Accept", "application/json");

        int responseCode = connection.getResponseCode();
        log.info("Response Code: {}", responseCode);

        StringBuilder response = new StringBuilder();
        try (BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
        } catch (IOException e) {
            log.error("InputStream 읽기 오류: {}", e.getMessage());
            return; // 오류 발생 시 메서드 종료
        }

        // 응답 내용 확인
        String responseString = response.toString();
        log.info("Response: {}", responseString);

        if (responseCode == HttpURLConnection.HTTP_OK) {
            if (responseString == null || responseString.isEmpty()) {
                log.error("응답 본문이 비어 있습니다.");
                return;
            }

            try {
                JSONObject gemJson = new JSONObject(responseString);

                // Gems 배열 확인
                if (gemJson.has("Gems") && gemJson.getJSONArray("Gems").length() > 0) {
                    JSONObject gem = gemJson.getJSONArray("Gems").getJSONObject(0);

                    // Name 확인
                    String name = gem.getString("Name");
                    if (name.contains("작열")) {
                        System.out.println("[작열]이 이름에 포함되어 있습니다.");
                    } else if (name.contains("겁화")) {
                        System.out.println("[겁화]가 이름에 포함되어 있습니다.");
                    } else {
                        System.out.println("[작열] 또는 [겁화]가 이름에 포함되어 있지 않습니다.");
                    }

                    // Tooltip 데이터 파싱
                    String tooltipData = gem.getString("Tooltip");
                    JSONObject tooltipJson = new JSONObject(tooltipData);

                    // Element_001의 스킬 이름 추출
                    String skillName = tooltipJson.getJSONObject("Element_001").getJSONObject("value").getString("leftStr0");
                    System.out.println("스킬 이름: " + skillName);
                } else {
                    log.error("Gems 데이터가 없습니다.");
                }
            } catch (JSONException e) {
                log.error("JSON 파싱 오류: {}", e.getMessage());
            }
        } else {
            log.error("Failed to fetch gems. Response Code: {}, Response: {}", responseCode, responseString);
        }
    }
}
