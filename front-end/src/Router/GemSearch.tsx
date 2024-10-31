import axios from "axios";
import classIconList from "../data/classIcon.json"; // JSON 파일 경로
import useDarkMode from "../hooks/useDarkMode";

interface ClassIcon {
  Class: string;
  Icon: string;
}

interface ClassIconList {
  [key: string]: ClassIcon[];
}

const classIconListTyped: ClassIconList = classIconList;

function GemSearch() {
  // class 순서
  const classOrder: string[] = ["전사", "마법사", "무도가", "암살자", "헌터", "스페셜리스트"];

  const axios = require("axios");

  function gemSerchAPI(a, b, i) {
    axios
      .post(
        "https://developer-lostark.game.onstove.com/auctions/items",
        {
          ItemLevelMin: 0,
          ItemLevelMax: 0,
          ItemGradeQuality: null,
          SkillOptions: [
            {
              FirstOption: a.Value,
              SecondOption: null,
              MinValue: null,
              MaxValue: null,
            },
          ],
          EtcOptions: [
            {
              FirstOption: null,
              SecondOption: null,
              MinValue: null,
              MaxValue: null,
            },
          ],
          Sort: "BUY_PRICE",
          CategoryCode: 210000,
          CharacterClass: null,
          ItemTier: itemTier,
          ItemGrade: null,
          ItemName: `${gemLevel} ${itemTier === "3" ? (gemDamCol === "멸화" ? "멸화" : "홍염") : gemDamCol === "멸화" ? "겁화" : "작열"}`,
          PageNo: 0,
          SortCondition: "ASC",
        },
        {
          headers: {
            accept: "application/json",
            authorization: `bearer ${apiKey[i].replaceAll(" ", "")}`,
            "content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        let classGem = response.data; // Parse the response data
        count++;
        if (classGem.TotalCount !== 0) {
          let apiSearchValue = {}; // Create object
          apiSearchValue.skillValue = a.Value; // Store skill value
          apiSearchValue.price = classGem.Items[0].AuctionInfo.BuyPrice; // Store buy price
          apiSearchValue.skillName = a.Text; // Store skill name
          apiSearchValue.className = b; // Store class name
          apiSearchValue.Icon = a.Icon; // Store icon path
          setGemListAll((gemListAll) => [...gemListAll, apiSearchValue]); // Add to list
          setNowClassSkillCount(count);
          console.log(apiSearchValue);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 429) {
          count--;
          // Retry after 22 seconds if all API keys are used
          if (apiKey.reduce((a, b) => (b !== "" ? a + 1 : a), 0) === i + 1) {
            setTimeout(() => {
              apiSend(a, b, 0);
            }, 22000);
          }
          // Retry with the next API key
          else {
            apiSend(a, b, i + 1);
          }
        } else {
          console.error("API request failed:", error.message);
        }
      });
  }

  return (
    <>
      {/*class 선택창*/}
      <div className="mt-20 flex flex-row justify-center items-start py-4 px-6 gap-6 dark:border-bddark dark:bg-ctdark border rounded-md border-ctdark border-solid">
        {classOrder.map((className) => {
          return (
            <div key={className}>
              {/* 통합 class 이름 */}
              <h2 className="text-center font-bold mb-2">{className}</h2>
              <div className="flex flex-col justify-center items-start gap-2">
                {classIconListTyped[className].map((classIcon: ClassIcon) => {
                  return (
                    <label key={classIcon.Class} className="flex flex-row  items-center justify-center gap-2">
                      <input value={classIcon.Class} id={classIcon.Class} type="checkbox" />
                      {/*class 이미지 아이콘*/}
                      <img className={"w-7 h-7 transition-all"} src={classIcon.Icon} alt={classIcon.Class} />
                      {/*class 이름*/}
                      <span className="font-semibold">{classIcon.Class}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default GemSearch;
