import axios from "axios";
import classIconList from "../../data/classIcon.json"; // JSON 파일 경로
import liveGemList from "../../data/liveGemList.json"; // JSON 파일 경로
import React, { useState, useEffect } from "react";
import classSkillData from "../../data/classSkill.json"; // classSkill.json 파일 경로
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface liveGemListTpye {
  name: string;
  price: number;
  Icon: string;
  Grade: string;
}

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

interface GemList {
  skillValue: number;
  price: number;
  skillName: string;
  className: string;
  Icon: string;
  skillUseRate: { skillName: string; recruitmentRate: number };
  Tier: string;
  gemLevel: string;
  gemDamCol: string;
}

const classIconListTyped: ClassIconList = classIconList;
const classSkill: ClassSkill = classSkillData;

function GemSearch() {
  /**class목록 추출 */
  // const classSkillList = Object.keys(classSkill);
  //다크모드
  const darkMode = useSelector((state: RootState) => state.dark.isDark);
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
  const [gemListAll, setGemListAll] = useState<GemList[]>([]);
  //채용률
  const [recruitmentRate, setRecruitmentRate] = useState<number>(30);

  //정렬 기준 설정
  const [sort, setSort] = useState<string>("price");

  //검색된 보석 리스트 정렬
  const [sortedGemList, setSortedGemList] = useState<GemList[]>([]);

  //보여줄 리스트 체크박스 설정(price가 0인것, price가 있는것, 둘다보기)
  const [showGemList1, setShowGemList1] = useState<boolean>(true);
  const [showGemList2, setShowGemList2] = useState<boolean>(true);

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
  function gemSerchAPISend() {
    count = 0;
    setGemListAll([]);
    //api 키가 없을 때 경고창 띄우기
    if (apikeycount === 0) {
      alert("API 키가 없습니다.");
      return;
    }

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
        const classGem = response?.data;
        count++;
        let skillUseRateData = skillUseRate[b][gemDamCol == "딜" ? "겁" : "작"].find((c: { skillName: "string"; recruitmentRate: "number" }) => c.skillName == a.Text);
        if (skillUseRateData === undefined) skillUseRateData = { skillName: b, recruitmentRate: 0 };
        if (true) {
          const apiSearchValue = {
            skillValue: a.Value,
            price: classGem?.Items[0]?.AuctionInfo?.BuyPrice ?? 0,
            skillName: a.Text,
            className: b,
            Icon: a.Icon,
            skillUseRate: skillUseRateData,
            Tier: itemTier,
            gemLevel: gemLevel.replace("레벨", ""),
            gemDamCol: gemDamCol,
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
              Tier: itemTier,
              gemLevel: gemLevel.replace("레벨", ""),
              gemDamCol: gemDamCol,
            };
            setGemListAll((prevList) => [...prevList, apiSearchValue]);
            setNowClassSkillCount(count);
            console.log(apiSearchValue);
          }
        }
      });
  }

  //스킬 채용률 api
  const [skillUseRate, setSkillUseRate] = useState<Record<string, any>>({});
  function skillUseRateSerchAPI() {
    axios
      .get("/api/v1/gemData/readData")
      .then((response) => {
        setSkillUseRate(response.data);
      })
      .catch((error) => {
        console.error("API request failed:", error.message);
      });
  }

  /**실시간 보석 시세 검색 api */
  const [liveGemPrice, setLiveGemPrice] = useState<liveGemListTpye[]>([]);
  //갱신시간
  const [liveGemLastUpdateTime, setLiveGemLastUpdateTime] = useState<string>("");
  function liveGemPriceSerchAPI() {
    axios
      .get("/api/v1/gemApi/nowGemPrice")
      .then((response) => {
        const gemPrices = liveGemList.map((a) => {
          return { name: a.name, price: response.data["시세"][a.name].buyPrice, Icon: a.icon, Grade: a.Grade };
        });
        setLiveGemLastUpdateTime(response.data["갱신 시간"]);

        setLiveGemPrice(gemPrices);
      })
      .catch((error) => {
        console.error("API request failed:", error.message);
      });
  }

  //페이지 로드시 실행
  useEffect(() => {
    liveGemPriceSerchAPI();
    skillUseRateSerchAPI();
  }, []);

  // 정렬 기준에 따른 리스트 업데이트(가격순, 채용률순)
  useEffect(() => {
    const sortedList: GemList[] = [...gemListAll];
    //가격순 정렬 (가격이 같을 경우 채용률순 정렬)
    if (sort === "price") {
      sortedList.sort((a, b) => {
        if (b.price === a.price) {
          return b.skillUseRate.recruitmentRate - a.skillUseRate.recruitmentRate;
        }
        return b.price - a.price;
      });
      //채용률순 정렬 (채용률이 같을 경우 가격순 정렬)
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

  //스킬개수 계산
  useEffect(() => {
    setClassSkillCount(0);
    let classCount = 0;

    checked.forEach((a) => {
      classCount += classSkill[a].length;
    });

    setClassSkillCount(classCount);
  }, [checked, classSkill]); // 의존성 배열에 classSkill 추가

  return (
    <>
      <div className="h-full w-full xl:grid xl:grid-cols-2 flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4 text-nowrap">
          {/* class 선택 창 */}
          <div className="flex flex-row justify-center items-start flex-wrap py-4 px-4 gap-2 bg-gray-50 dark:bg-ctdark border rounded-sm shadow-md">
            {classOrder.map((className) => (
              <div key={className}>
                {/* 통합 class 이름 */}
                <h2 className="text-center font-bold mb-2">{className}</h2>
                <div className="w-full flex flex-col justify-center items-start gap-2">
                  {classIconListTyped[className].map((classIcon: ClassIcon) => (
                    <label key={classIcon.Class} className="w-full flex flex-row items-center justify-center gap-2">
                      <input className="hidden" value={classIcon.Class} id={classIcon.Class} type="checkbox" checked={checked.includes(classIcon.Class)} onChange={handleCheck} />
                      <div className={`btn transition-all cursor-pointer w-full flex justify-start items-center gap-2 py-2 px-5 rounded-md  ${checked.includes(classIcon.Class) ? "bg-[#e3e3e3] dark:bg-bgdark text-white" : ""}`}>
                        {/* class 이미지 아이콘 */}
                        <img className={`w-7 h-7 ${darkMode === false ? " white-Mode-icon-filter" : null}`} src={classIcon.Icon} alt={classIcon.Class} />
                        {/* class 이름 */}
                        <span className="font-semibold ">{classIcon.Class}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="md:grid md:grid-cols-[1fr_3fr] flex flex-col gap-4 ">
            {/*보석 옵션 설정창*/}
            <div className="w-full flex justify-start items-center py-6 px-6 bg-gray-50 dark:bg-ctdark rounded-sm shadow-md">
              <div className="w-full flex flex-col justify-center items-start gap-4">
                <div className="font-semibold">검색 옵션</div>
                <div className="w-full grid grid-cols-[1.5fr_1fr_1fr] grid-rows-4 gap-2 text-sm font-semibold">
                  {/*보석 티어*/}
                  <span className="flex justify-center items-center">보석 티어</span>
                  <button onClick={() => setItemTier("3")} className={"btn transition-all w-14 py-1 px-2 rounded-md " + `${itemTier == "3" ? "bg-[#e3e3e3] dark:bg-bgdark dark:text-white" : ""}`}>
                    3티어
                  </button>
                  <button onClick={() => setItemTier("4")} className={"btn transition-all w-14 py-1 px-2 rounded-md " + `${itemTier == "4" ? "bg-[#e3e3e3] dark:bg-bgdark dark:text-white" : ""}`}>
                    4티어
                  </button>
                  {/*보석 종류*/}
                  <span className="flex justify-center items-center">보석 종류</span>
                  <button onClick={() => setGemDamCol("딜")} className={"btn transition-all w-14 py-1 px-2 rounded-md " + `${gemDamCol == "딜" ? "bg-[#e3e3e3] dark:bg-bgdark dark:text-white" : ""}`}>
                    {itemTier === "3" ? "멸화" : "겁화"}
                  </button>
                  <button onClick={() => setGemDamCol("쿨감")} className={"btn transition-all w-14 py-1 px-2 rounded-md " + `${gemDamCol == "쿨감" ? "bg-[#e3e3e3] dark:bg-bgdark dark:text-white" : ""}`}>
                    {itemTier === "3" ? "홍염" : "작열"}
                  </button>
                  {/*보석 레벨*/}
                  <span className="flex justify-center items-center">보석 레벨</span>
                  <select className="col-start-2 col-end-4 bg-[#e3e3e3] rounded-md dark:bg-bgdark text-center" onChange={(e) => setGemLevel(e.target.value)} defaultValue={gemLevel}>
                    <option className="font-semibold" value="5레벨">
                      5레벨
                    </option>
                    <option className="font-semibold" value="6레벨">
                      6레벨
                    </option>
                    <option className="font-semibold" value="7레벨">
                      7레벨
                    </option>
                    <option className="font-semibold" value="8레벨">
                      8레벨
                    </option>
                    <option className="font-semibold" value="9레벨">
                      9레벨
                    </option>
                    <option className="font-semibold" value="10레벨">
                      10레벨
                    </option>
                  </select>
                  <div className="flex justify-center items-center gap-2"></div>
                  {/* 스킬 사용율 % 설정, on/off 버튼에따라 활성화 비활성화 */}
                  <div className="flex justify-center items-center gap-2 col-start-1 col-end-3 row-start-4">
                    <span>검색수</span>
                    <span>{`${nowClassSkillCount}/${classSkillCount}`}</span>
                  </div>
                  {/*검색 버튼*/}
                  <button className="row-start-4 py-1 px-2 border-solid border border-bddark rounded-md hover:bg-[#373737] transition-all" onClick={() => gemSerchAPISend()}>
                    검색
                  </button>
                </div>
              </div>
            </div>

            {/* <div className="basis-full flex justify-start items-start py-6 px-6 bg-gray-50 dark:bg-ctdark rounded-sm shadow-md">
              <div className="h-full w-full flex flex-col justify-start items-start gap-4 ">
                <div className="font-semibold">검색 필터</div>
                <div className="grid grid-cols-[1.5fr_1fr_1fr] grid-rows-3 gap-2 text-sm font-semibold">
                  <span className="col-start-1 flex justify-center items-center">정렬 기준</span>
                  <select className="col-start-2 col-end-4 rounded-md bg-[#e3e3e3] dark:bg-bgdark text-center " onChange={(e) => setSort(e.target.value)} defaultValue={sort}>
                    <option className="font-semibold" value="recruitmentRate">
                      채용률
                    </option>
                    <option className="font-semibold" value="price">
                      가격
                    </option>
                  </select>

                  <div className="col-start-1 col-end-2 flex justify-center items-center gap-2">
                    <span>채용률</span>
                    <span className="w-10 flex justify-center items-center ">{recruitmentRate}%</span>
                  </div>
                  <input className="col-start-2 col-end-4 ml-2" onChange={(e) => setRecruitmentRate(Number(e.target.value))} type="range" min="0" max="100" step="5" defaultValue={30} />

                  <span className="row-start-3 flex justify-center items-center">매물</span>

                  <button onClick={() => setShowGemList1(!showGemList1)} className={"btn row-start-3 w-14 py-1 px-2 rounded-md " + `${showGemList1 == true ? "bg-[#e3e3e3] dark:bg-bgdark dark:text-white" : ""}`}>
                    있음
                  </button>
                  <button onClick={() => setShowGemList2(!showGemList2)} className={"btn row-start-3 w-14 py-1 px-2 rounded-md " + `${showGemList2 == true ? "bg-[#e3e3e3] dark:bg-bgdark dark:text-white" : ""}`}>
                    없음
                  </button>
                </div>
              </div>
            </div> */}

            <div className="row-start-1 row-end-3 col-start-2 py-6 px-6 bg-gray-50 dark:bg-ctdark rounded-sm shadow-md">
              <div className="flex justify-between font-semibold mb-4">
                <div className="">실시간 보석 시세</div>
                <div className="flex justify-center items-center text-gray-400 gap-2">
                  <i className="xi-clock-o xi-x"></i>
                  <div className="h-auto">{liveGemLastUpdateTime}</div>
                </div>
              </div>
              {apikeycount === 0 ? (
                <div className="h-3/4 flex justify-center items-center">API키를 등록해야 확인가능합니다.</div>
              ) : (
                <div className="grid grid-cols-[1fr_1.5fr_1.5fr_1.5fr_1.5fr] grid-rows-[0.5fr_0.5fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 text-center font-medium">
                  <h3 className="col-start-2 col-span-2 text-center font-bold">3티어</h3>
                  <h3 className="col-start-4 col-span-2 text-center font-bold">4티어</h3>
                  <span className="col-span-1 font-semibold">레벨</span>
                  <span className="col-span-1 font-semibold">멸화</span>
                  <span className="col-span-1 font-semibold">홍염</span>
                  <span className="col-span-1 font-semibold">겁화</span>
                  <span className="col-span-1 font-semibold">작열</span>
                  {[5, 6, 7, 8, 9, 10].map((level) => (
                    <React.Fragment key={level}></React.Fragment>
                  ))}

                  {liveGemPrice.map((gem, index: number) => (
                    <React.Fragment key={gem.Icon}>
                      {index % 4 === 0 && <span className="flex justify-center items-center font-semibold">{Math.floor(index / 4) + 5}레벨</span>}
                      <div className="col-span-1 flex justify-end items-center gap-2">
                        <span>{gem.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "N/A"}</span>
                        <img className={`rounded-md p-0.5 w-10 h-10 ${gem.Grade}`} src={gem.Icon} />
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/*검색된 보석 리스트 */}
        <div className="flex flex-col">
          {/*필터 설정창*/}
          <div className="w-full flex justify-between items-start  py-4 px-4 bg-gray-50 dark:bg-ctdark rounded-sm shadow-md mb-4">
            <div className="w-full flex justify-center items-center flex-wrap gap-10 text-sm font-semibold">
              {/* 정렬 기준 선택 */}
              <div className="flex justify-center items-center gap-3">
                <span className="flex justify-center items-center">정렬 기준</span>
                <select className="w-20 py-1 rounded-md bg-[#e3e3e3] dark:bg-bgdark text-center " onChange={(e) => setSort(e.target.value)} defaultValue={sort}>
                  <option className="font-semibold" value="recruitmentRate">
                    채용률
                  </option>
                  <option className="font-semibold" value="price">
                    차익
                  </option>
                </select>
              </div>

              {/*채용률 조정해서 보이기 type = range */}

              <div className="flex justify-center items-center gap-2">
                <div className="flex justify-center items-center gap-2">
                  <span>채용률</span>
                  <span className="w-10 flex justify-center items-center ">{recruitmentRate}%</span>
                </div>
                <input onChange={(e) => setRecruitmentRate(Number(e.target.value))} type="range" min="0" max="100" step="5" defaultValue={30} />
              </div>

              <div className="flex justify-center items-center gap-2">
                {/* 가격 0원 제외, 매물없는것만 보기 버튼 둘다 input 총 3개의 버튼 선택해서 필터 */}
                <span className="flex justify-center items-center">매물</span>
                {/* <button onClick={() => setShowGemList("all")} className={"row-start-3 w-14 py-1 px-2 rounded-md hover:bg-[#373737] " + `${showGemList == "all" ? "bg-hover dark:bg-bgdark" : ""}`}>
                      전부
                    </button> */}
                <button onClick={() => setShowGemList1(!showGemList1)} className={"btn w-14 py-1 px-2 rounded-md " + `${showGemList1 == true ? "bg-[#e3e3e3] dark:bg-bgdark dark:text-white" : ""}`}>
                  있음
                </button>
                <button onClick={() => setShowGemList2(!showGemList2)} className={"btn w-14 py-1 px-2 rounded-md " + `${showGemList2 == true ? "bg-[#e3e3e3] dark:bg-bgdark dark:text-white" : ""}`}>
                  없음
                </button>
              </div>
            </div>
          </div>
          <div className="h-full flex flex-col justify-start items-center bg-gray-50  dark:bg-ctdark rounded-sm shadow-md text-nowrap">
            {/** 검색된 보석 리스트 table header */}
            <div className="w-full py-4 grid grid-cols-[1fr_1.5fr_3fr_1fr_1fr_1fr_12px] text-center font-bold">
              <div>아이콘</div>
              <div>직업</div>
              <div>스킬 이름</div>
              <div>가격</div>
              <div>차익</div>
              <div>채용률(%)</div>
              {/*스크롤바 */}
              <div></div>
            </div>
            {/** 검색된 보석 리스트 table */}
            <div className="flex-grow-0 h-[100vh] custom-scrollbar w-full">
              {sortedGemList.map((gem) => {
                if (gem.price === 0 && !showGemList2) return null;
                if (gem.price !== 0 && !showGemList1) return null;
                if (gem.skillUseRate.recruitmentRate < recruitmentRate) return null;
                return (
                  <div key={gem.Icon} className="hover:bg-hover dark:hover:bg-gray-700 transition-colors grid grid-cols-[1fr_1.5fr_3fr_1fr_1fr_1fr] w-full font-medium">
                    <div className="border border-bddark py-2  flex justify-center items-center">
                      <img src={gem.Icon} alt="스킬아이콘" className="w-8 h-8" />
                    </div>
                    <div className="border border-bddark py-2  flex items-center justify-center">{gem.className}</div>
                    <div className="border border-bddark py-2 flex items-center justify-center">{gem.skillName}</div>
                    <div className="border border-bddark py-2 flex items-center justify-center">{gem?.price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                    <div className="border border-bddark py-2 flex items-center justify-center">
                      {gem.price === 0 ? 0 : (gem.price - Number(liveGemPrice[(Number(gem.gemLevel) - 5) * 4 + (gem.gemDamCol === "딜" ? 0 : 1) + (gem.Tier === "3" ? 0 : 2)]?.price ?? 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </div>
                    <div className="border border-bddark py-2 flex items-center justify-center">{gem.skillUseRate.recruitmentRate}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default GemSearch;
