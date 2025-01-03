import axios from "axios";
import classIconList from "../../data/classIcon.json"; // JSON 파일 경로
import liveGemList from "../../data/liveGemList.json"; // JSON 파일 경로
import React, { useState, useEffect, useRef } from "react";
import classSkillData from "../../data/classSkill.json"; // classSkill.json 파일 경로
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useAlert } from "../../hooks/useAlert";
import { GemSearchMetas } from "../../metadatas/metadatas";

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
  const alertBox = useAlert();

  //다크모드
  const darkMode = useSelector((state: RootState) => state.dark.isDark);
  // class 순서
  const classOrder: string[] = ["전사", "마법사", "무도가", "암살자", "헌터", "스페셜리스트"];

  /** 전체 스킬 개수 (총 API 검색 수) */
  const [classSkillCount, setClassSkillCount] = useState(0);
  /** 현재 전체 스킬 개수 (현재 총 API 점색 수) */
  const [nowClassSkillCount, setNowClassSkillCount] = useState(0);
  const [isSearching, setIsSearching] = useState<boolean>(true);

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
  const [recruitmentRate, setRecruitmentRate] = useState<number>(70);

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
  const handleCheck = (className: string) => {
    setNowClassSkillCount(0);
    // const updatedList = e.target.checked ? [...checked, e.target.value] : checked.filter((item) => item !== e.target.value);
    const updatedList = checked.includes(className) ? checked.filter((item) => item !== className) : [...checked, className];

    setChecked(updatedList);
  };

  let count = useRef(0); // API 카운트
  let apicount = useRef(0); // API 키 카운트
  const apikeycount = apiKey.reduce((a, b) => (b !== "" ? a + 1 : a), 0); // API 키 개수

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function gemSerchAPISend() {
    try {
      count.current = 0;
      setGemListAll([]);
      // API 키가 없을 때 경고창 띄우기
      if (apikeycount === 0) {
        alertBox("API키를 등록해주세요.");
        return;
      }

      // 클래스 선택 안했을 때 경고창 띄우기
      if (classSkillCount === 0) {
        alertBox("클래스를 선택해주세요.");
        return;
      }

      //서버 점검중인지 확인
      const response = await axios.get(`https://developer-lostark.game.onstove.com/news/alarms`, {
        headers: {
          accept: "application/json",
          authorization: `bearer ${apiKey[0].trim()}`,
          "content-Type": "application/json",
        },
      });
      if (response.status !== 200) {
        alertBox("서버가 점검중입니다.");
        return; // 상태 코드가 200이 아닌 경우 함수 종료
      }

      alertBox("검색이 멈추면 잠시 기다려주세요.");
      setIsSearching(false);

      // 체크한 직업만큼 반복
      for (const b of checked) {
        // 체크한 직업의 스킬만큼 반복
        for (const className of classSkill[b]) {
          apicount.current++;

          // 딜레이 추가
          await delay(100); // 0.1초 대기

          // 검색 API 호출
          await gemSerchAPI(className, b, apicount.current % apikeycount);
        }
      }
    } catch (error) {
      alertBox("서버가 점검중입니다.");
    }
  }

  useEffect(() => {
    if (nowClassSkillCount === classSkillCount) {
      setIsSearching(true);
    }
  }, [nowClassSkillCount]);

  /** Gem 검색 API */
  function gemSerchAPI(a: Skill, b: string, i: number) {
    axios
      .post(
        "https://developer-lostark.game.onstove.com/auctions/items",
        {
          SkillOptions: [
            {
              FirstOption: a.Value,
            },
          ],
          Sort: "BUY_PRICE",
          CategoryCode: 210000,
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
        count.current++;
        let skillUseRateData = skillUseRate[b][gemDamCol == "딜" ? "겁" : "작"].find((c: { skillName: "string"; recruitmentRate: "number" }) => c.skillName == a.Text);
        if (skillUseRateData === undefined) skillUseRateData = { skillName: a.Text, recruitmentRate: 0 };
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
          setNowClassSkillCount(count.current);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          alertBox(`${i + 1}번째 API키 오류`);
          setIsSearching(true);
          return;
        }
        if (error.response && error.response.status === 429) {
          setTimeout(() => {
            gemSerchAPI(a, b, i + 1);
          }, 22000);
        } else {
          let skillUseRateData = skillUseRate[b][gemDamCol == "딜" ? "겁" : "작"].find((c: { skillName: "string"; recruitmentRate: "number" }) => c.skillName == a.Text);
          if (skillUseRateData === undefined) skillUseRateData = { skillName: a.Text, recruitmentRate: 0 };
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
            setNowClassSkillCount(count.current);
          }
        }
      });
  }

  //스킬 채용률 api
  const [skillUseRate, setSkillUseRate] = useState<Record<string, any>>({});
  function skillUseRateSerchAPI() {
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/api/v1/gemData/readData`)
      .then((response) => {
        setSkillUseRate(response.data);
      })
      .catch((error) => {
        alertBox("스킬 데이터를 불러오는데 실패했습니다.");
        console.error("API request failed:", error.message);
      });
  }

  /**실시간 보석 시세 검색 api */
  const [liveGemPrice, setLiveGemPrice] = useState<liveGemListTpye[]>([]);
  //갱신시간
  const [liveGemLastUpdateTime, setLiveGemLastUpdateTime] = useState<string>("");
  function liveGemPriceSerchAPI() {
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/api/v1/gemApi/nowGemPrice`)
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
      <GemSearchMetas></GemSearchMetas>
      <div className="sm:text-sm text-xs 2xl:max-w-[1700px] max-w-[900px] h-full w-full 2xl:grid 2xl:grid-cols-[1.2fr_1fr] flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4 text-nowrap">
          {/* class 선택 창 */}
          <div className="content-box p-6 flex flex-col">
            <div className="sm:text-base text-sm font-bold mb-4">클래스 선택</div>
            <div className="flex sm:flex-row flex-col justify-evenly gap-2">
              {classOrder.map((className) => (
                <div key={className}>
                  {/* 통합 class 이름 */}
                  <h2 className="sm:text-base text-sm text-center font-bold my-2">{className}</h2>
                  <div className="grid sm:grid-cols-1 grid-cols-3 gap-2">
                    {classIconListTyped[className].map((classIcon: ClassIcon) => (
                      <button key={classIcon.Class} onClick={() => handleCheck(classIcon.Class)} className={`flex  md:justify-start justify-center items-center rounded-md gap-2 py-2 px-3 classIconHover ${checked.includes(classIcon.Class) ? "active-btn" : "default-btn"}`}>
                        {/* class 이미지 아이콘 */}
                        <img className={`md:block hidden transition-all w-5 h-5  ${darkMode === false && !checked.includes(classIcon.Class) ? " white-Mode-icon-filter" : null}`} src={classIcon.Icon} alt={classIcon.Class} />
                        {/* class 이름 */}
                        <span className="font-bold">{classIcon.Class}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:grid md:grid-cols-[1fr_3fr] flex flex-col gap-4 ">
            {/*보석 옵션 설정창*/}
            <div className="w-full flex justify-start items-center py-6 px-6 bg-gray-50 dark:bg-ctdark rounded-sm shadow-md">
              <div className="w-full flex flex-col justify-center items-start gap-4">
                <div className="sm:text-base text-sm font-semibold">검색 옵션</div>
                <div className="w-full grid md:grid-cols-[1.5fr_1fr] grid-cols-[1fr_2fr] grid-rows-4 gap-2 font-semibold">
                  {/*보석 티어*/}
                  <span className="flex justify-center items-center">티어</span>
                  <div className="flex justify-center items-center">
                    <button onClick={() => setItemTier("3")} className={`w-1/2 rounded-l-md py-1 px-2 ${itemTier == "3" ? "active-btn" : "default-btn"}`}>
                      3티어
                    </button>
                    <button onClick={() => setItemTier("4")} className={`w-1/2 rounded-r-md py-1 px-2 ${itemTier == "4" ? "active-btn" : "default-btn"}`}>
                      4티어
                    </button>
                  </div>
                  {/*보석 종류*/}
                  <span className="flex justify-center items-center">종류</span>
                  <div className="flex justify-center items-center">
                    <button onClick={() => setGemDamCol("딜")} className={`w-1/2 rounded-l-md p-1 px-2 ${gemDamCol == "딜" ? "active-btn" : "default-btn"}`}>
                      {itemTier === "3" ? "멸화" : "겁화"}
                    </button>
                    <button onClick={() => setGemDamCol("쿨감")} className={`w-1/2 rounded-r-md py-1 px-2 ${gemDamCol == "쿨감" ? "active-btn" : "default-btn"}`}>
                      {itemTier === "3" ? "홍염" : "작열"}
                    </button>
                  </div>
                  {/*보석 레벨*/}
                  <span className="flex justify-center items-center">레벨</span>
                  <select className="bg-blue-400 rounded-md dark:bg-bgdark text-center text-white shadow-md" onChange={(e) => setGemLevel(e.target.value)} defaultValue={gemLevel}>
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
                  {/* 스킬 사용율 % 설정, on/off 버튼에따라 활성화 비활성화 */}
                  <div className="col-span-2 flex justify-center items-center gap-2">
                    <span>검색수</span>
                    <span>{`${nowClassSkillCount}/${classSkillCount}`}</span>
                  </div>
                  {/*검색 버튼*/}
                  {isSearching ? (
                    <button className="btn py-2 col-span-2" onClick={() => gemSerchAPISend()}>
                      <span>검색</span>
                    </button>
                  ) : (
                    <button className="btn py-2 col-span-2" onClick={() => alertBox("검색중 입니다.")}>
                      <i className="xi-spinner-3 xi-spin xi-x"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="sm:block hidden row-start-1 row-end-3 col-start-2 py-6 px-6 bg-gray-50 dark:bg-ctdark rounded-sm shadow-md">
              <div className="flex justify-between font-semibold mb-4">
                <div className="sm:text-base text-sm">실시간 보석 시세</div>
                <div className="flex justify-center items-center text-gray-400 gap-2">
                  <i className="xi-clock-o xi-x"></i>
                  <div className="h-auto">{liveGemLastUpdateTime}</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-[1fr_1.5fr_1.5fr_1.5fr_1.5fr] grid-rows-[0.5fr_0.5fr_1fr_1fr_1fr_1fr_1fr] gap-2 text-center font-medium">
                <span className="sm:block hidden col-span-1 font-semibold">레벨</span>
                <span className="col-span-1 font-semibold">멸화</span>
                <span className="col-span-1 font-semibold">홍염</span>
                <span className="col-span-1 font-semibold">겁화</span>
                <span className="col-span-1 font-semibold">작열</span>
                {[5, 6, 7, 8, 9, 10].map((level) => (
                  <React.Fragment key={level}></React.Fragment>
                ))}

                {liveGemPrice.map((gem, index: number) => (
                  <React.Fragment key={gem.Icon}>
                    {index % 4 === 0 && <span className="sm:flex hidden  justify-center items-center font-semibold">{Math.floor(index / 4) + 5}레벨</span>}
                    <div className="col-span-1 flex justify-end items-center gap-2">
                      <span>{gem.price.toLocaleString()}</span>
                      <img className={`rounded-md p-0.5 w-8 h-8 ${gem.Grade}`} src={gem.Icon} />
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/*검색된 보석 리스트 */}
        <div className="flex flex-col">
          {/*필터 설정창*/}
          <div className="w-full flex justify-between items-start  py-4 px-4 bg-gray-50 dark:bg-ctdark rounded-sm shadow-md mb-4">
            <div className="w-full flex justify-evenly items-center flex-wrap gap-3 font-semibold">
              {/* 정렬 기준 선택 */}
              {/* <div className="flex justify-center items-center gap-3">
                <span className="flex justify-center items-center">정렬 기준</span>
                <div className="grid grid-cols-2">
                  <button onClick={() => setSort("recruitmentRate")} className={`rounded-l-md py-1 px-2 ${sort === "recruitmentRate" ? "active-btn" : "default-btn"}`}>
                    채용률
                  </button>
                  <button onClick={() => setSort("price")} className={`rounded-r-md py-1 px-2 ${sort === "price" ? "active-btn" : "default-btn"}`}>
                    가격
                  </button>
                </div>
              </div> */}

              {/*채용률 조정해서 보이기 type = range */}

              <div className="flex justify-center items-center gap-2">
                <div className="flex justify-center items-center gap-2">
                  <span>채용률</span>
                  <span className="w-10 flex justify-center items-center ">{recruitmentRate}%</span>
                </div>
                <input className="dark:accent-light" onChange={(e) => setRecruitmentRate(Number(e.target.value))} type="range" min="0" max="100" step="5" defaultValue={70} />
              </div>

              <div className="flex justify-center items-center gap-2">
                {/* 가격 0원 제외, 매물없는것만 보기 버튼 둘다 input 총 3개의 버튼 선택해서 필터 */}
                <span className="flex justify-center items-center">매물</span>
                {/* <button onClick={() => setShowGemList("all")} className={"row-start-3 w-14 py-1 px-2 rounded-md hover:bg-[#373737] " + `${showGemList == "all" ? "bg-hover dark:bg-bgdark" : ""}`}>
                      전부
                    </button> */}
                <button onClick={() => setShowGemList1(!showGemList1)} className={`rounded-md py-1 px-2 ${showGemList1 === true ? "active-btn" : "default-btn"}`}>
                  있음
                </button>
                <button onClick={() => setShowGemList2(!showGemList2)} className={`rounded-md py-1 px-2 ${showGemList2 === true ? "active-btn" : "default-btn"}`}>
                  없음
                </button>
              </div>
            </div>
          </div>
          <div className="h-full flex flex-col justify-start items-center bg-gray-50  dark:bg-ctdark rounded-sm shadow-md text-nowrap">
            {/** 검색된 보석 리스트 table header */}
            <div className="w-full py-4 grid min-[500px]:grid-cols-[1fr_1.5fr_3fr_1fr_1fr_1fr_12px] grid-cols-[1fr_1.5fr_3fr_1fr_1fr_12px] text-center font-bold">
              <div>아이콘</div>
              <div>직업</div>
              <div>스킬</div>
              <button onClick={() => setSort("price")} className={"flex justify-center items-center gap-1 " + `${sort === "price" ? "text-green-500" : null}`}>
                <div>가격</div>
                <i className="xi-caret-down-min"></i>
              </button>
              <button onClick={() => setSort("recruitmentRate")} className={"flex justify-center items-center gap-1 " + `${sort === "recruitmentRate" ? "text-green-500" : null}`}>
                <div>채용률</div>
                <i className="xi-caret-down-min"></i>
              </button>
              <div className="min-[500px]:block hidden">차익</div>
              {/*스크롤바 */}
              <div></div>
            </div>
            {/** 검색된 보석 리스트 table */}
            <div className="flex-grow-0 h-[100vh] custom-scrollbar w-full">
              {sortedGemList.map((gem) => {
                if (gem.price === 0 && !showGemList2) return null;
                if (gem.price !== 0 && !showGemList1) return null;
                if (gem.skillUseRate.recruitmentRate < recruitmentRate) return null;
                //홀리나이트, 도화가, 바드 일때 4티어 딜 보석 일때만 출력
                if ((gem.skillName === "신성의 오라" || gem.skillName === "음양 스킬" || gem.skillName === "세레나데 스킬") && !(gem.Tier === "4" && gem.gemDamCol === "딜")) return null;

                return (
                  <div key={gem.skillValue} className="hover:bg-hover dark:hover:bg-gray-700 transition-colors grid min-[500px]:grid-cols-[1fr_1.5fr_3fr_1fr_1fr_1fr] grid-cols-[1fr_1.5fr_3fr_1fr_1fr] w-full font-medium">
                    <div className="border border-bddark py-2  flex justify-center items-center">
                      <img src={gem.Icon} alt="스킬아이콘" className="w-8 h-8" />
                    </div>
                    <div className="border border-bddark py-2  flex items-center justify-center">{gem.className}</div>
                    <div className="border border-bddark py-2 flex items-center justify-center">{gem.skillName}</div>
                    <div className="border border-bddark py-2 flex items-center justify-center">{gem?.price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                    <div className="border border-bddark py-2 flex items-center justify-center">{Math.round(gem.skillUseRate.recruitmentRate)}%</div>
                    <div className={"border border-bddark py-2  items-center justify-center min-[500px]:flex hidden"}>
                      {gem.price === 0 ? 0 : (gem.price - Number(liveGemPrice[(Number(gem.gemLevel) - 5) * 4 + (gem.gemDamCol === "딜" ? 0 : 1) + (gem.Tier === "3" ? 0 : 2)]?.price ?? 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </div>
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
