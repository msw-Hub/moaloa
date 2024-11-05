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
  const [gemDamCol, setGemDamCol] = useState<string>(() => JSON.parse(localStorage.getItem("gemDamCol") || '딜"'));
  //아이템 티어
  const [itemTier, setItemTier] = useState<string>(() => JSON.parse(localStorage.getItem("itemTier") || '"3"'));
  //검색된 보석 리스트
  const [gemListAll, setGemListAll] = useState<Array<Record<string, any>>>([]);

  //paice내림차순으로 정렬
  useEffect(() => {
    gemListAll.sort((a, b) => b.price - a.price);
  }, [gemListAll]);

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
        if (classGem.TotalCount !== 0) {
          const apiSearchValue = {
            skillValue: a.Value,
            price: classGem.Items[0].AuctionInfo.BuyPrice,
            skillName: a.Text,
            className: b,
            Icon: a.Icon,
          };
          setGemListAll((prevList) => [...prevList, apiSearchValue]);
          setNowClassSkillCount(count);
          console.log(apiSearchValue);
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
          console.error("API request failed:", error.message);
        }
      });
  }

  //스킬개수 계산
  useEffect(() => {
    setClassSkillCount(0);
    let classCount = 0;

    // 만약 classSkill이라는 변수를 사용하지 않는다면, 해당 코드를 제거
    // classSkill[a].forEach(() => {
    //   classCount++;
    // });

    checked.forEach((a) => {
      // classSkill[a].forEach(() => {
      //   classCount++;
      // });
      // 위의 코드를 아래와 같이 수정
      classCount += classSkill[a].length;
    });

    setClassSkillCount(classCount);
  }, [checked, classSkill]); // 의존성 배열에 classSkill 추가

  //보석 페이지 설정
  const [page, setPage] = useState<number>(1);

  //이전 페이지 전환 함수
  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Calculate the total number of pages
  const totalPages = Math.ceil(gemListAll.length / 10);

  // Update the nextPage function to check against totalPages
  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <>
      <div className="flex flex-row justify-center items-center gap-4">
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
          <div className="h-52 flex justify-center items-center gap-4">
            {/*보석 옵션 설정창*/}
            <div className="h-full flex justify-center items-center py-4 px-6 dark:border-bddark dark:bg-ctdark border rounded-md border-ctdark border-solid">
              <div className="w-full flex flex-col justify-center items-center gap-2">
                {/*보석 티어*/}
                <div className="flex justify-between items-center gap-2">
                  <span>보석 티어</span>
                  <div className="flex justify-center items-center">
                    <button onClick={() => setItemTier("3")} className={"w-14 py-1 px-2 rounded-md " + `${itemTier == "3" ? "bg-hover dark:bg-bgdark" : ""}`}>
                      3티어
                    </button>
                    <button onClick={() => setItemTier("4")} className={"w-14 py-1 px-2 rounded-md " + `${itemTier == "4" ? "bg-hover dark:bg-bgdark" : ""}`}>
                      4티어
                    </button>
                  </div>
                </div>
                {/*보석 종류*/}
                <div className="flex justify-between items-center gap-2">
                  <span>보석 종류</span>
                  <div className="flex justify-center items-center">
                    <button onClick={() => setGemDamCol("딜")} className={"w-14 py-1 px-2 rounded-md " + `${gemDamCol == "딜" ? "bg-hover dark:bg-bgdark" : ""}`}>
                      {itemTier === "3" ? "멸화" : "겁화"}
                    </button>
                    <button onClick={() => setGemDamCol("쿨감")} className={"w-14 py-1 px-2 rounded-md " + `${gemDamCol == "쿨감" ? "bg-hover dark:bg-bgdark" : ""}`}>
                      {itemTier === "3" ? "홍염" : "작열"}
                    </button>
                  </div>
                </div>
                {/*보석 레벨*/}
                <div className="flex justify-between items-center gap-2">
                  <span>보석 레벨</span>
                  <select className="bg-hover dark:bg-ctdark w-28 text-center" onChange={(e) => setGemLevel(e.target.value)} defaultValue={gemLevel}>
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
                <div className="flex justify-between items-center w-full">
                  {/*검색수*/}
                  <div className="text-center">
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
            {/*TODO 필터 ON/OFF*/}
            {/* 스킬 사용율 % 설정, on/off 버튼에따라 활성화 비활성화 */}
            <div className="basis-full h-full flex justify-center items-center py-4 px-6 dark:border-bddark dark:bg-ctdark border rounded-md border-ctdark border-solid">필터</div>
          </div>
        </div>
        {/* 검색된 보석 리스트 */}
        <div className="relative h-full w-[800px] flex flex-col justify-start items-center border border-solid border-bddark rounded-md">
          {/** 검색된 보석 리스트 table */}
          <table className="min-w-full border-collapse border border-bddark ">
            <thead className="">
              <tr className="flex justify-between absolute top-0 left-0 right-0 bg-gray-100 dark:bg-bgdark text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                <th className="border border-bddark py-2 px-4">아이콘</th>
                <th className="border border-bddark py-2 px-4">직업</th>
                <th className="border border-bddark py-2 px-4">스킬이름</th>
                <th className="border border-bddark py-2 px-4">가격</th>
              </tr>
            </thead>
            <div className="h-10"></div>
            <tbody className="">
              {gemListAll.map((a, i) => {
                const pageStart = (page - 1) * 10;

                // 페이지에 따라 보여줄 아이템을 정함
                if (i < pageStart || i >= pageStart + 10) return null;
                return a.price != null ? (
                  <tr key={gemListAll[i].icon} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="border border-bddark py-2 px-4">
                      <img src={gemListAll[i].Icon} alt="스킬아이콘" className="w-8 h-8" />
                    </td>
                    <td className="border border-bddark py-2 px-4">{gemListAll[i].className}</td>
                    <td className="border border-bddark py-2 px-4">{gemListAll[i].skillName}</td>
                    <td className="border border-bddark py-2 px-4">{gemListAll[i].price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                  </tr>
                ) : null;
              })}
            </tbody>
            <tfoot className="absolute bottom-2 left-0 right-0 w-full flex justify-center items-center gap-4">
              <button onClick={prevPage} disabled={page === 1}>
                이전
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button onClick={nextPage} disabled={page === totalPages}>
                다음
              </button>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}

export default GemSearch;
