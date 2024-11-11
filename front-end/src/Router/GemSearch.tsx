import axios from "axios";
import classIconList from "../data/classIcon.json"; // JSON 파일 경로
import { useState, useEffect } from "react";
import classSkillData from "../data/classSkill.json"; // classSkill.json 파일 경로
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface ClassIcon {
  Class: string;
  Icon: string;
}

interface ClassIconList {
  [key: string]: ClassIcon[];
}

interface Skill {
  Value: number;
  Text: string;
  Class: string;
  Icon: string;
}

interface ClassSkill {
  [key: string]: Skill[];
}

const classIconListTyped: ClassIconList = classIconList;
const classSkill: ClassSkill = classSkillData;

function GemSearch() {
  /**class목록 추출 */
  // const classSkillList = Object.keys(classSkill);

  // class 순서
  const classOrder: string[] = ["전사", "마법사", "무도가", "암살자", "헌터", "스페셜리스트"];

  /** 전체 스킬 개수 (총 API 검색 수) */
  const [classSkillCount, setClassSkillCount] = useState(0);
  /** 현재 전체 스킬 개수 (현재 총 API 점색 수) */
  const [nowClassSkillCount, setNowClassSkillCount] = useState(0);
  /** API 키 */
  const apiKey = useSelector((state: RootState) => state.apiKeys.apiKey);
  /** 체크한 직업 */
  const [checked, setChecked] = useState<string[]>(() => JSON.parse(localStorage.getItem("checked") || "[]"));
  //보석 레벨
  const [gemLevel, setGemLevel] = useState<string>(() => JSON.parse(localStorage.getItem("gemLevel") || '"5레벨"'));
  //보석 종류
  const [gemDamCol, setGemDamCol] = useState<string>(() => JSON.parse(localStorage.getItem("gemDamCol") || '"딜"'));
  //아이템 티어
  const [itemTier, setItemTier] = useState<string>(() => JSON.parse(localStorage.getItem("itemTier") || '"3"'));
  //검색된 보석 리스트
  const [gemListAll, setGemListAll] = useState<Array<Record<string, any>>>([]);
  //채용률
  const [recruitmentRate, setRecruitmentRate] = useState<number>(30);

  //정렬 기준 설정
  const [sort, setSort] = useState<string>("recruitmentRate");

  //검색된 보석 리스트 정렬
  const [sortedGemList, setSortedGemList] = useState<Array<Record<string, any>>>([]);

  //보여줄 리스트 체크박스 설정(price가 0인것, price가 있는것, 둘다보기)
  const [showGemList, setShowGemList] = useState<string>("all");

  //gemLevel-localstorage 저장
  useEffect(() => {
    window.localStorage.setItem("gemLevel", JSON.stringify(gemLevel));
  }, [gemLevel]);

  //itemTier-localstorage 저장
  useEffect(() => {
    window.localStorage.setItem("itemTier", JSON.stringify(itemTier));
  }, [itemTier]);

  useEffect(() => {
    window.localStorage.setItem("gemDamCol", JSON.stringify(gemDamCol));
  }, [gemDamCol]);

  //api-key-localstorage저장
  useEffect(() => {
    window.localStorage.setItem("apiKey", JSON.stringify(apiKey.map((a) => a.replaceAll(" ", ""))));
  }, [apiKey]);

  //ckecked-localstorage저장
  useEffect(() => {
    window.localStorage.setItem("checked", JSON.stringify(checked));
  }, [checked]);

  /** 직업 체크할 때마다 실시 칸 배열 저장 */
  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNowClassSkillCount(0);
    e.stopPropagation();
    const updatedList = e.target.checked ? [...checked, e.target.value] : checked.filter((item) => item !== e.target.value);

    setChecked(updatedList);
  };

  let count = 0; // 검색 카운트
  let apicount = 0; // API 카운트
  const apikeycount = apiKey.reduce((a, b) => (b !== "" ? a + 1 : a), 0); // API 키 개수

  /** API 실행 */
  function api() {
    count = 0;
    setGemListAll([]);
    // 체크한 직업만큼 반복
    checked.forEach((b) => {
      // 체크한 직업의 스킬만큼 반복
      classSkill[b].forEach((className: Skill) => {
        // 검색 API
        apicount++;
        if (Math.trunc(apicount / 100) === apikeycount) apicount = 0;
        gemSerchAPI(className, b, Math.trunc(apicount / 100));
      });
    });
  }

  /** Gem 검색 API */
  function gemSerchAPI(a: Skill, b: string, i: number) {
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
          ItemName: `${gemLevel} ${itemTier === "3" ? (gemDamCol === "딜" ? "멸화" : "홍염") : gemDamCol === "딜" ? "겁화" : "작열"}`,
          PageNo: 0,
          SortCondition: "ASC",
        },
        {
          headers: {
            accept: "application/json",
            authorization: `bearer ${apiKey[i].trim()}`,
            "content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        const classGem = response.data;
        count++;
        let skillUseRateData = skillUseRate[b][gemDamCol == "딜" ? "겁" : "작"].find((c: { skillName: "string"; recruitmentRate: "number" }) => c.skillName == a.Text);
        if (skillUseRateData === undefined) skillUseRateData = { skillName: b, recruitmentRate: 0 };
        if (true) {
          const apiSearchValue = {
            skillValue: a.Value,
            price: classGem?.Items[0]?.AuctionInfo?.BuyPrice,
            skillName: a.Text,
            className: b,
            Icon: a.Icon,
            skillUseRate: skillUseRateData,
          };
          setGemListAll((prevList) => [...prevList, apiSearchValue]);
          setNowClassSkillCount(count);
          // console.log(apiSearchValue);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 429) {
          count--;
          if (apikeycount === i + 1) {
            setTimeout(() => {
              gemSerchAPI(a, b, 0);
            }, 22000);
          } else {
            gemSerchAPI(a, b, i + 1);
          }
        } else {
          let skillUseRateData = skillUseRate[b][gemDamCol == "딜" ? "겁" : "작"].find((c: { skillName: "string"; recruitmentRate: "number" }) => c.skillName == a.Text);
          if (skillUseRateData === undefined) skillUseRateData = { skillName: b, recruitmentRate: 0 };
          if (true) {
            const apiSearchValue = {
              skillValue: a.Value,
              price: 0,
              skillName: a.Text,
              className: b,
              Icon: a.Icon,
              skillUseRate: skillUseRateData,
            };
            setGemListAll((prevList) => [...prevList, apiSearchValue]);
            setNowClassSkillCount(count);
            // console.log(apiSearchValue);
          }
          console.error("API request failed:", error.message);
        }
      });
  }

  //스킬개수 계산
  useEffect(() => {
    setClassSkillCount(0);
    let classCount = 0;

    checked.forEach((a) => {
      classCount += classSkill[a].length;
    });

    setClassSkillCount(classCount);
  }, [checked, classSkill]); // 의존성 배열에 classSkill 추가

  // //보석 페이지 설정
  // const [page, setPage] = useState<number>(1);

  // //이전 페이지 전환 함수
  // const prevPage = () => {
  //   if (page > 1) {
  //     setPage(page - 1);
  //   }
  // };

  // // Calculate the total number of pages
  // const totalPages = Math.ceil(gemListAll.length / 10);

  // // Update the nextPage function to check against totalPages
  // const nextPage = () => {
  //   if (page < totalPages) {
  //     setPage(page + 1);
  //   }
  // };

  //TODO : apikey가 없을 때 경고창 띄우기

  //스킬 사용률 api
  const [skillUseRate, setSkillUseRate] = useState<Record<string, any>>({});
  useEffect(() => {
    axios
      .get("/api/v1/gemData/readData")
      .then((response) => {
        setSkillUseRate(response.data);
      })
      .catch((error) => {
        console.error("API request failed:", error.message);
      });
  }, []);

  // 정렬 기준에 따른 리스트 업데이트
  // 정렬 기준에 따른 리스트 업데이트
  useEffect(() => {
    const sortedList = [...gemListAll];
    if (sort === "price") {
      sortedList.sort((a, b) => {
        if (b.price === a.price) {
          return b.skillUseRate.recruitmentRate - a.skillUseRate.recruitmentRate;
        }
        return b.price - a.price;
      });
    } else if (sort === "recruitmentRate") {
      sortedList.sort((a, b) => {
        if (b.skillUseRate.recruitmentRate === a.skillUseRate.recruitmentRate) {
          return b.price - a.price;
        }
        return b.skillUseRate.recruitmentRate - a.skillUseRate.recruitmentRate;
      });
    }
    setSortedGemList(sortedList);
  }, [sort, gemListAll]);

  return (
    <>
      <div className="h-full w-full max-w-[2000px] grid gap-4 mt-20 px-20 grid-rows-responsive grid-cols-responsive">
        <div className="flex flex-col gap-4 text-nowrap">
          {/* class 선택 창 */}
          <div className="flex flex-row justify-center items-start py-4 px-4 gap-2 dark:border-bddark dark:bg-ctdark border rounded-md border-ctdark border-solid">
            {classOrder.map((className) => (
              <div key={className}>
                {/* 통합 class 이름 */}
                <h2 className="text-center font-bold mb-2">{className}</h2>
                <div className="w-full flex flex-col justify-center items-start gap-2">
                  {classIconListTyped[className].map((classIcon: ClassIcon) => (
                    <label key={classIcon.Class} className="w-full flex flex-row items-center justify-center gap-2">
                      <input className="hidden" value={classIcon.Class} id={classIcon.Class} type="checkbox" checked={checked.includes(classIcon.Class)} onChange={handleCheck} />
                      <div className={`transition-all cursor-pointer hover:bg-[#373737] w-full flex justify-center items-center gap-2 py-2 px-5 rounded-md  ${checked.includes(classIcon.Class) ? "bg-light dark:bg-bgdark" : ""}`}>
                        {/* class 이미지 아이콘 */}
                        <img className="w-7 h-7 " src={classIcon.Icon} alt={classIcon.Class} />
                        {/* class 이름 */}
                        <span className="font-semibold">{classIcon.Class}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-rows-[1fr_1fr] grid-cols-[1fr_3fr] gap-4 font-semibold ">
            {/*보석 옵션 설정창*/}
            <div className="flex justify-center items-center py-4 px-6 dark:border-bddark dark:bg-ctdark border rounded-md border-ctdark border-solid">
              <div className="w-full grid grid-cols-1 grid-rows-4 gap-2">
                {/*보석 티어*/}
                <div className="flex justify-center items-center gap-2">
                  <span>보석 티어</span>
                  <div className="flex justify-center items-center gap-2">
                    <button onClick={() => setItemTier("3")} className={"w-14 py-1 px-2 rounded-md hover:bg-[#373737] " + `${itemTier == "3" ? "bg-hover dark:bg-bgdark" : ""}`}>
                      3티어
                    </button>
                    <button onClick={() => setItemTier("4")} className={"w-14 py-1 px-2 rounded-md hover:bg-[#373737] " + `${itemTier == "4" ? "bg-hover dark:bg-bgdark" : ""}`}>
                      4티어
                    </button>
                  </div>
                </div>
                {/*보석 종류*/}
                <div className="flex justify-center items-center gap-2">
                  <span>보석 종류</span>
                  <div className="flex justify-center items-center gap-2">
                    <button onClick={() => setGemDamCol("딜")} className={"w-14 py-1 px-2 rounded-md hover:bg-[#373737] " + `${gemDamCol == "딜" ? "bg-hover dark:bg-bgdark" : ""}`}>
                      {itemTier === "3" ? "멸화" : "겁화"}
                    </button>
                    <button onClick={() => setGemDamCol("쿨감")} className={"w-14 py-1 px-2 rounded-md hover:bg-[#373737] " + `${gemDamCol == "쿨감" ? "bg-hover dark:bg-bgdark" : ""}`}>
                      {itemTier === "3" ? "홍염" : "작열"}
                    </button>
                  </div>
                </div>
                {/*보석 레벨*/}
                <div className="flex justify-center items-center gap-2">
                  <span>보석 레벨</span>
                  <select className="bg-hover dark:bg-ctdark w-[7.5rem] text-center" onChange={(e) => setGemLevel(e.target.value)} defaultValue={gemLevel}>
                    <option value="5레벨">5레벨</option>
                    <option value="6레벨">6레벨</option>
                    <option value="7레벨">7레벨</option>
                    <option value="8레벨">8레벨</option>
                    <option value="9레벨">9레벨</option>
                    <option value="10레벨">10레벨</option>
                  </select>
                </div>
                {/*TODO 필터 ON/OFF*/}
                {/* 스킬 사용율 % 설정, on/off 버튼에따라 활성화 비활성화 */}
                <div className="flex justify-center items-center gap-12">
                  {/*검색수*/}
                  <div className="flex justify-center items-center gap-2">
                    <span>검색수</span>
                    <span>{`${nowClassSkillCount}/${classSkillCount}`}</span>
                  </div>
                  {/*검색 버튼*/}
                  <button className="py-1 px-2 border-solid border border-bddark rounded-md hover:bg-[#373737] transition-all" onClick={() => api()}>
                    검색
                  </button>
                </div>
              </div>
            </div>
            {/*필터 설정창*/}
            <div className="basis-full flex justify-center items-center py-4 px-6 dark:border-bddark dark:bg-ctdark border rounded-md border-ctdark border-solid">
              <div className="w-full flex flex-col justify-center items-center gap-4">
                {/* 정렬 기준 선택 */}
                <div className="flex justify-between items-center w-full">
                  <span>정렬 기준</span>
                  <select className="bg-hover dark:bg-ctdark w-28 text-center" onChange={(e) => setSort(e.target.value)} defaultValue={sort}>
                    <option value="recruitmentRate">채용률</option>
                    <option value="price">가격</option>
                  </select>
                </div>
                {/*채용률 조정해서 보이기 type = range */}
                <div className="flex justify-between items-center w-full">
                  <span>채용률</span>
                  <span>{recruitmentRate}%</span>
                  <input className="" onChange={(e) => setRecruitmentRate(Number(e.target.value))} type="range" min="0" max="100" step="5" defaultValue={30} />
                </div>
                {/* 가격 0원 제외, 매물없는것만 보기 버튼 둘다 input 총 3개의 버튼 선택해서 필터 */}
                <div className="flex justify-between items-center w-full gap-4">
                  <span>매물</span>
                  <div className="flex justify-center items-center gap-2">
                    <button onClick={() => setShowGemList("all")} className={"w-14 py-1 px-2 rounded-md hover:bg-[#373737] " + `${showGemList == "all" ? "bg-hover dark:bg-bgdark" : ""}`}>
                      전부
                    </button>
                    <button onClick={() => setShowGemList("available")} className={"w-14 py-1 px-2 rounded-md hover:bg-[#373737] " + `${showGemList == "available" ? "bg-hover dark:bg-bgdark" : ""}`}>
                      있음
                    </button>
                    <button onClick={() => setShowGemList("unavailable")} className={"w-14 py-1 px-2 rounded-md hover:bg-[#373737] " + `${showGemList == "unavailable" ? "bg-hover dark:bg-bgdark" : ""}`}>
                      없음
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/*실시간 보석 시세 */}
            <div className="row-start-1 row-end-3 col-start-2 py-4 px-6 dark:border-bddark dark:bg-ctdark border rounded-md border-ctdark border-solid"></div>
          </div>
        </div>
        {/*검색된 보석 리스트 */}
        <div className="flex flex-col justify-start items-center border border-solid border-bddark rounded-md text-nowrap">
          {/** 검색된 보석 리스트 table header */}
          <div className="w-full grid grid-cols-[1fr_1.5fr_3fr_1fr_1fr_12px] text-center">
            <div className="border border-bddark py-2 px-4">아이콘</div>
            <div className="border border-bddark py-2 px-4">직업</div>
            <div className="border border-bddark py-2 px-4">스킬 이름</div>
            <div className="border border-bddark py-2 px-4">가격</div>
            <div className="border border-bddark py-2 px-4">채용률(%)</div>
            {/*스크롤바 */}
            <div></div>
          </div>

          {/** 검색된 보석 리스트 table */}
          <div className="flex-grow-0 h-[740px] custom-scrollbar w-full">
            {sortedGemList.map((gem) => {
              if (showGemList === "available" && gem.price === 0) {
                return null; // 조건에 맞지 않으면 null 반환
              }
              if (showGemList === "unavailable" && gem.price !== 0) {
                return null; // 조건에 맞지 않으면 null 반환
              }
              if (gem.skillUseRate.recruitmentRate < recruitmentRate) {
                return null; // 조건에 맞지 않으면 null 반환
              }

              return (
                <div key={gem.Icon} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors grid grid-cols-[1fr_1.5fr_3fr_1fr_1fr] w-full">
                  <div className="border border-bddark py-2 px-4 flex justify-center items-center">
                    <img src={gem.Icon} alt="스킬아이콘" className="w-8 h-8" />
                  </div>
                  <div className="border border-bddark py-2 px-4 flex items-center justify-center">{gem.className}</div>
                  <div className="border border-bddark py-2 px-4 flex items-center justify-center">{gem.skillName}</div>
                  <div className="border border-bddark py-2 px-4 flex items-center justify-center">{gem.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                  <div className="border border-bddark py-2 px-4 flex items-center justify-center">{gem.skillUseRate.recruitmentRate}</div>
                </div>
              );
            })}
          </div>

          {/* <div className="w-full flex justify-center items-center gap-4 mt-4">
            <button onClick={prevPage} disabled={page === 1} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50">
              이전
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button onClick={nextPage} disabled={page === totalPages} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50">
              다음
            </button>
          </div> */}
        </div>
      </div>
    </>
  );
}

export default GemSearch;
