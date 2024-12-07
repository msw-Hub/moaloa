import { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "../../components/modal";
import { useNavigate } from "react-router-dom";

interface CraftMaterial {
  id: number;
  marketName: string;
  grade: string;
  currentMinPrice: number;
  recentPrice: number;
  marketId: number;
  subCode: number;
  iconLink: string;
  bundleCount: number;
  quantity: number;
  ydayAvgPrice: number;
  convertMaterial: MaterialItem;
}

interface CraftItem {
  id: number; //제작법 아이디
  marketId: number; //제작법 경매장 아이디
  craftName: string; //제작법 이름
  marketName: string; //제작법 경매장 이름
  category: number; //카테고리
  craftQuantity: number; //제작량
  bundleCount: number; //아이템 묶음 단위
  craftPrice: number; //제작비용
  activityPrice: number; //활동력
  exp: number; //제작 경험치
  craftTime: number; //제작 시간
  iconLink: string; //아이콘 링크
  grade: string; //등급
  currentMinPrice: number; //현재 최저가
  recentPrice: number; //최근 팔린 가격
  craftMaterials: CraftMaterial[]; //제작 재료
  ydayAvgPrice: number; //전날 평균 가격
  craftPriceAll: number; //전체 제작 비용
  craftSellPrice: number; //판매 차익
  craftCostMargin: number; //원가이익률
  tradeCount: number; //거래량
}

//생활재료 가격 타입
interface Material {
  식물채집: MaterialItem[];
  채광: MaterialItem[];
  낚시: MaterialItem[];
  수렵: MaterialItem[];
  고고학: MaterialItem[];
  벌목: MaterialItem[];
}

interface MaterialItem {
  marketId: number;
  marketName: string;
  currentMinPrice: number;
  grade: string;
  convertPrice?: number;
  convertMaterial?: MaterialItem;
}

interface CraftEffect {
  [key: string]: number[];
}

interface Grade {
  [key: string]: string;
}

// `localStorage`에서 값을 가져와서 `craftEffect` 상태를 초기화하는 함수
const getInitialCraftEffect = (): CraftEffect => {
  const savedEffect = localStorage.getItem("craftEffect");
  return savedEffect
    ? JSON.parse(savedEffect)
    : {
        "제작수수료 감소": [0, 0, 0, 0, 0, 0, 0, 0],
        "제작시간 감소": [0, 0, 0, 0, 0, 0, 0, 0],
        "활동력 감소": [0, 0, 0, 0, 0, 0, 0, 0],
      };
};

function Craft() {
  const [craftList, setCraftList] = useState<CraftItem[]>([]);
  const [craftModalOpen, setCraftModalOpen] = useState(false);
  const [craftEffect, setCraftEffect] = useState<CraftEffect>(getInitialCraftEffect);
  const [categoryMenu, setCategoryMenu] = useState<boolean[]>([false, false, false, false, false, false, false, false]);
  const [searchName, setSearchName] = useState<string>("");
  const [materialList, setMaterialList] = useState<Material>();
  //시세 기준 (현재 최저가 : currentMinPrice, 전날가격 : ydayAvgPrice )
  const [priceStandard, setPriceStandard] = useState<string>("currentMinPrice");

  //정렬 기준 설정
  const [sort, setSort] = useState<string>("craftSellPrice");
  const [sortedCraftList, setSortedCraftList] = useState<CraftItem[]>([]);

  const navigate = useNavigate();

  const grade: Grade = {
    일반: "imgBackground1",
    고급: "imgBackground2",
    희귀: "imgBackground3",
    영웅: "imgBackground4",
    전설: "imgBackground5",
    유물: "imgBackground6",
    고대: "imgBackground7",
  };

  function getCraftList() {
    axios("/api/v1/craft/readDataAll")
      .then((res) => {
        const updatedCraftList = res.data.craftItemList.map((craft: CraftItem) => {
          return {
            ...craft,
            ...calculateCraftValues(craft),
          };
        });
        setCraftList(updatedCraftList);
        setMaterialList(materialConversion(res.data["생활재료시세"]));
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // 컴포넌트가 마운트될 때 `getCraftList` 함수를 호출
  useEffect(() => {
    getCraftList();
  }, []);

  useEffect(() => {
    console.log(craftList);
  }, [craftList]);

  useEffect(() => {
    console.log(materialList);
  }, [materialList]);

  // craftEffect 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("craftEffect", JSON.stringify(craftEffect));
  }, [craftEffect]);

  //판매량 순위 계산
  const [tradeRank, setTradeRank] = useState<CraftItem[]>([]);
  //표시할 판매량 순위 조정 변수
  const [tradeRankCount, setTradeRankCount] = useState<number>(10);
  useEffect(() => {
    // marketName이 같은 항목을 제거
    const uniqueCraftList = craftList.filter((item, index, self) => index === self.findIndex((t) => t.marketName === item.marketName));

    // tradeCount에 따라 정렬
    const sortedList: CraftItem[] = [...uniqueCraftList];
    sortedList.sort((a, b) => b.tradeCount * b.bundleCount - a.tradeCount * a.bundleCount);

    setTradeRank(sortedList);
  }, [craftList]);

  function materialConversion(materials: Material): Material {
    const updatedMaterials = { ...materials };

    for (const materialKey in updatedMaterials) {
      if (materialKey === "식물채집" || materialKey === "벌목" || materialKey === "채광" || materialKey === "수렵" || materialKey === "낚시" || materialKey === "고고학") {
        const material = updatedMaterials[materialKey];

        //아비도스 교환 비율 계산 후 저장
        //생활 가루 구입 탭
        let grade1 = (material[0].currentMinPrice / 8) * 100; //일반 100개 -> 가루 80개
        let grade2 = (material[1].currentMinPrice / 8) * 50; //고급 50개 -> 가루 80개

        //생활 재료 교환 탭
        //희귀 1개 -> 일반 10개
        if (materialKey === "채광" || materialKey === "벌목") {
          if (material[0].currentMinPrice * 10 > material[2].currentMinPrice) {
            grade1 = (material[2].currentMinPrice / 8) * 10; //단단한 철광석 1개 -> 철광석 10개 , 튼튼한 목재 1개 -> 목재 10개
            updatedMaterials[materialKey][0] = {
              ...material[0],
              convertMaterial: material[2], //단단한 철광석
              convertPrice: material[2].currentMinPrice / 10,
            };
          }

          //고급 재료 25개 -> 일반 재료 50개
          if (material[0].currentMinPrice * 2 > material[1].currentMinPrice) {
            grade1 = (material[1].currentMinPrice / 8) * 50;
            updatedMaterials[materialKey][0] = {
              ...material[0],
              convertMaterial: material[1],
              convertPrice: material[1].currentMinPrice / 2,
            };
          }
        }

        //일반, 고급 재료 중 아비도스 보다 저렴한 재료를 반환
        if (grade1 < material[3].currentMinPrice || grade2 < material[3].currentMinPrice) {
          updatedMaterials[materialKey][3] = {
            ...material[3],
            convertMaterial: grade1 < grade2 ? material[0] : material[1], //grade1이 더 저렴하면 grade1을 변환
            convertPrice: grade1 < grade2 ? grade1 : grade2,
          };
        }
        //일반, 고급 재료 중 오레하 보다 저렴한 재료를 반환
        if (materialKey === "고고학" || materialKey === "낚시" || materialKey === "수렵") {
          if (grade1 < material[2].currentMinPrice || grade2 < material[2].currentMinPrice) {
            updatedMaterials[materialKey][2] = {
              ...material[2],
              convertMaterial: grade1 < grade2 ? material[0] : material[1], //grade1이 더 저렴하면 grade1을 변환
              convertPrice: grade1 < grade2 ? grade1 : grade2,
            };
          }
        }
      }
    }
    return updatedMaterials;
  }

  //제작 비용 계산 및 판매 차익 계산
  function calculateCraftValues(craftItem: CraftItem) {
    let totalMaterialCost = 0;

    let subCode: { [key: number]: string } = {
      90200: "식물채집",
      90300: "벌목",
      90400: "채광",
      90500: "수렵",
      90600: "낚시",
      90700: "고고학",
    };

    craftItem.craftMaterials.forEach((material) => {
      if (materialList && subCode[material.subCode]) {
        const materialCheck = materialList[subCode[material.subCode] as keyof Material];
        if (materialCheck) {
          const convertPrice = materialCheck.find((a) => a.marketId === material.marketId)?.convertPrice || material.currentMinPrice;
          const totalMaterialCostForItem = (convertPrice / material.bundleCount) * material.quantity;
          totalMaterialCost += totalMaterialCostForItem;
        }
      } else {
        const totalMaterialCostForItem = (material.currentMinPrice / material.bundleCount) * material.quantity;
        totalMaterialCost += totalMaterialCostForItem;
      }
    });

    let craftPriceAll;

    // 제작수수료 감소 효과 적용
    const totalCraftCost = totalMaterialCost + Math.floor(craftItem.craftPrice * (1 - 0.01 * (craftEffect["제작수수료 감소"][0] + craftEffect["제작수수료 감소"][craftItem.category])));
    craftPriceAll = Math.ceil(totalCraftCost * 100) / 100;
    // if (craftItem.craftName === "아비도스 융화 재료(벌목)") console.log(totalCraftCost, totalMaterialCost, craftItem.craftPrice, craftEffect["제작수수료 감소"][0], craftEffect["제작수수료 감소"][craftItem.category]);
    // if (craftItem.craftName === "아비도스 융화 재료(벌목)") console.log(craftItem.craftPrice * (1 - 0.01 * (craftEffect["제작수수료 감소"][0] + craftEffect["제작수수료 감소"][craftItem.category])));
    // // 판매 차익 계산 수수료 5% 포함 소수점은 무조건 올림
    const priceStandardValue = Math.round(craftItem[priceStandard as keyof CraftItem] as number);
    if (typeof priceStandardValue === "number") {
      const sellPrice = priceStandardValue - Math.ceil(priceStandardValue * 0.05);
      const craftSellPrice = Math.ceil((craftItem.craftQuantity * (sellPrice / craftItem.bundleCount) - craftPriceAll) * 100) / 100;
      // 원가이익률 계산
      const craftCostMargin = Math.round((craftSellPrice / (priceStandardValue * craftItem.craftQuantity - craftSellPrice)) * 10000) / 100;
      return {
        craftPriceAll, // 제작 비용
        craftSellPrice, // 판매 차익
        craftCostMargin, // 원가이익률
      };
    } else {
      throw new Error(`Invalid priceStandard value: ${priceStandardValue}`);
    }
  }

  // 제작 비용
  function calculateCraftPriceAll() {
    const updatedCraftList = craftList.map((craftItem) => {
      return {
        ...craftItem,
        ...calculateCraftValues(craftItem),
      };
    });
    setCraftList(updatedCraftList);
  }

  //수수료가 변동되면 다시 계산
  useEffect(() => {
    calculateCraftPriceAll();
  }, [craftEffect, priceStandard]);

  //sort에 따라 정렬
  useEffect(() => {
    const sortedList: CraftItem[] = [...craftList];
    sortedList.sort((a, b) => {
      // if (sort === "currentMinPrice") {
      //   return b.currentMinPrice - a.currentMinPrice;
      // }
      // else if (sort === "craftPriceAll") {
      //   return b.craftPriceAll - a.craftPriceAll;
      // }
      if (sort === "craftSellPrice") {
        return b.craftSellPrice - a.craftSellPrice;
      } else if (sort === "craftCostMargin") {
        return b.craftCostMargin - a.craftCostMargin;
      }
      return 0;
    });
    setSortedCraftList(sortedList);
  }, [sort, craftList]);

  return (
    <div className="w-full h-full flex justify-center  gap-4 font-semibold lg:flex-row flex-col lg:items-start items-center p-2">
      {/* 카테고리 버튼 관심, 특수, 물약, 폭탄, 수류탄, 로브, 기타, 음식, */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col justify-center items-start content-box p-4 gap-4 ">
          <span className="font-semibold">카테고리</span>
          <div className="grid grid-cols-4 gap-2 ">
            {["추천", "특수", "물약", "폭탄", "수류탄", "로브", "기타", "요리"].map((category, index) => {
              return (
                <button
                  key={category}
                  onClick={() => {
                    setCategoryMenu((prev) => {
                      const updated = [...prev];
                      updated[index] = !updated[index];
                      return updated;
                    });
                  }}
                  className={"transition-all font-bold text-bgdark dark:text-gray-200 hover:bg-blue-300 hover:text-white dark:hover:bg-hoverdark shadow-md flex items-center justify-center rounded-sm py-2 px-4 text-nowrap " + (categoryMenu[index] ? " dark:bg-bgdark bg-blue-400 text-white" : "")}>
                  {category}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-4 content-box lg:block hidden">
          <div className="flex justify-start items-center mb-2 gap-4">
            <div className="font-semibold ">전날 판매량 순위</div>
            <div className="flex justify-start items-center gap-3">
              {[10, 20, 30, 40].map((count) => {
                return (
                  <button
                    key={count}
                    onClick={() => setTradeRankCount(count)}
                    className={
                      "transition-all font-bold text-bgdark dark:text-gray-200 hover:bg-blue-300 hover:text-white dark:hover:bg-hoverdark shadow-md py-1 px-2 text-sm flex items-center justify-center rounded-sm text-nowrap " + (tradeRankCount === count ? " dark:bg-bgdark bg-blue-400 text-white" : "")
                    }>
                    {count}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="w-full flex flex-col gap-1">
            {/*1위부터 10위까지 표시 */}
            {/*marketName이 같으면 출력x 카운트x */}
            {tradeRank.slice(0, tradeRankCount).map((craft: CraftItem, index: number) => {
              return (
                <div key={craft.id} className="flex justify-between items-center">
                  <div className="flex justify-start items-center gap-2">
                    <div className="w-4 text-end">{index + 1}</div>
                    <img className={"w-8 h-8 " + `${grade[craft.grade]}`} src={craft.iconLink} alt={craft.marketName} />
                    <span className="text-sm">{craft.marketName}</span>
                  </div>
                  <span className="text-sm">{(craft.tradeCount * craft.bundleCount).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 우측 레이아웃*/}
      <div className="flex flex-col gap-4 flex-wrap basis-[900px]">
        {/* 검색창 */}
        {/* 영지효과 버튼 */}
        <div className=" content-box grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-4 p-4 flex-wrap">
          <input onChange={(e) => setSearchName(e.target.value)} placeholder="제작법" type="text" className="col-span-7 h-10 content-box border-solid border rounded-md border-bddark p-4" />

          <div className="flex justify-center items-center gap-2 md:col-span-3 col-span-7">
            <span className="mr-2 font-bold">정렬기준</span>
            <button
              onClick={() => setSort("craftSellPrice")}
              className={"transition-all font-bold text-bgdark dark:text-gray-200 hover:bg-blue-300 hover:text-white dark:hover:bg-hoverdark shadow-md  py-2 px-4 rounded-md " + `${sort == "craftSellPrice" ? "dark:bg-bgdark bg-blue-400 text-white" : ""}`}>
              판매차익
            </button>
            <button
              onClick={() => setSort("craftCostMargin")}
              className={"transition-all font-bold text-bgdark dark:text-gray-200 hover:bg-blue-300 hover:text-white dark:hover:bg-hoverdark shadow-md py-2 px-4 rounded-md " + `${sort == "craftCostMargin" ? "dark:bg-bgdark bg-blue-400 text-white" : ""}`}>
              원가이익률
            </button>
          </div>

          <div className="md:col-span-3 col-span-7 flex justify-center items-center gap-2">
            <span className="mr-2 font-bold">판매시세</span>
            <button
              onClick={() => setPriceStandard("currentMinPrice")}
              className={"transition-all font-bold text-bgdark dark:text-gray-200 hover:bg-blue-300 hover:text-white dark:hover:bg-hoverdark shadow-md py-2 px-4 rounded-md " + `${priceStandard == "currentMinPrice" ? "dark:bg-bgdark bg-blue-400 text-white" : ""}`}>
              현재 최저가
            </button>
            <button
              onClick={() => setPriceStandard("ydayAvgPrice")}
              className={"transition-all font-bold text-bgdark dark:text-gray-200 hover:bg-blue-300 hover:text-white dark:hover:bg-hoverdark shadow-md py-2 px-4 rounded-md " + `${priceStandard == "ydayAvgPrice" ? "dark:bg-bgdark bg-blue-400 text-white" : ""}`}>
              전날 평균 가격
            </button>
          </div>

          <button onClick={() => setCraftModalOpen(true)} className="transition-all bg-blue-400 dark:bg-bgdark font-bold text-white dark:text-gray-200 hover:bg-blue-500 dark:hover:bg-hoverdark shadow-md text-nowrap py-2 px-3 col-span-7 flex items-center justify-center rounded-md ">
            영지효과
          </button>
        </div>

        {/* 제작품 목록 */}
        <div className="max-w-[1200px] p-4 content-box text-center flex flex-col  justify-center flex-wrap">
          <div className="grid md:grid-cols-[3fr_1fr_1fr_1fr_1fr_0.5fr_0.5fr] grid-cols-7 gap-4 py-2 px-4">
            <span>제작법</span>
            {priceStandard === "currentMinPrice" ? <span>현재 최저가</span> : <span>전날 평균가</span>}
            {/* <span>최저가</span> */}
            <span>제작비용</span>
            <span>판매차익</span>
            <span>원가이익률</span>
            <span>사용</span>
            <span>판매</span>
          </div>

          {sortedCraftList.map((craft: CraftItem) => {
            //제작법 이름 검색(내용이 없으면 전부 표시)
            if (searchName !== "" && !craft.craftName.includes(searchName)) return null;
            //카테고리 메뉴가 꺼져있으면 전부 표시
            if (categoryMenu.reduce((a, v) => (v == false ? a + 1 : a), 0) === 8) null;
            else if (!categoryMenu[craft.category]) return null;
            return (
              <div onClick={() => navigate(`/craft/${craft.id}`)} className="cursor-pointer hover:bg-hover dark:hover:bg-gray-700 transition-all grid md:grid-cols-[3fr_1fr_1fr_1fr_1fr_0.5fr_0.5fr] grid-cols-7 gap-4 border-t border-solid border-bddark py-2 px-4" key={craft.id}>
                {/* 이미지 및 제작 이름  */}
                <div className=" flex justify-start items-center gap-4">
                  <div className="relative">
                    <img src={craft.iconLink} alt={craft.craftName} className={"w-10 h-10 " + `${grade[craft.grade]}`} />
                    <div className="text-xs font-semibold absolute right-[0.125rem] bottom-0 text-white">{craft.craftQuantity}</div>
                  </div>
                  <span className="text-sm font-semibold md:block hidden">{craft.craftName}</span>
                </div>
                {/* 최저가 */}
                {priceStandard === "currentMinPrice" ? <span className="flex items-center justify-center text-center text-sm font-semibold">{craft.currentMinPrice}</span> : <span className="flex items-center justify-center text-center text-sm font-semibold">{Math.round(craft.ydayAvgPrice)}</span>}
                {/* 제작비용 */}
                <span className="flex items-center justify-center text-center text-sm font-semibold">{craft.craftPriceAll}</span>
                {/* 판매 차익 */}
                <span className="flex items-center justify-center text-sm font-semibold">{craft.craftSellPrice}</span>
                {/* 원가이익률(%) */}
                <span className="flex items-center justify-center text-sm font-semibold">{craft.craftCostMargin}%</span>
                {craft.currentMinPrice * craft.craftQuantity - craft.craftPriceAll > 0 ? <span className={"flex items-center justify-center text-green-400  text-sm font-semibold"}>이득</span> : <span className={"flex items-center justify-center text-blue-400 text-sm font-semibold"}>손해</span>}
                {craft.craftSellPrice > 0 ? <span className={"flex items-center justify-center text-green-400 text-sm font-semibold"}>이득</span> : <span className={"flex items-center justify-center text-blue-400 text-sm font-semibold"}>손해</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 영지 효과 입력창 - x열 제작수수료 감소, 활동력 감소, y열 전체, 특수, 물약, 폭탄, 수류탄, 로브, 기타 배템, 요리 */}
      <Modal isOpen={craftModalOpen} onClose={() => setCraftModalOpen(false)}>
        <div className="content-box p-8 flex flex-col gap-4 rounded-md">
          <span className="text-xl font-semibold">영지 효과</span>
          {["제작수수료 감소", "제작시간 감소", "활동력 감소"].map((effect: string) => {
            return (
              <div key={effect} className="flex flex-col gap-3">
                <span className="text-lg font-semibold">{effect}</span>
                <div className="grid grid-cols-4 gap-4">
                  {["전체", "특수", "물약", "폭탄", "수류탄", "로브", "기타", "요리"].map((type: string, index) => {
                    return (
                      <div key={type} className="relative flex items-center">
                        <span className="text-xs absolute -top-3 left-3 bg-gray-50 dark:bg-ctdark p-1">{type}</span>
                        <input
                          defaultValue={craftEffect[effect][index]}
                          type="number"
                          min={0}
                          max={100}
                          className="w-28 h-10 shadow-sm bg-gray-50 dark:bg-ctdark text-bgdark dark:text-light border-solid border rounded-md border-bddark p-4"
                          onChange={(e) => {
                            const newValue = Number(e.target.value);
                            setCraftEffect((prevEffect) => {
                              const updatedEffect = { ...prevEffect };
                              updatedEffect[effect][index] = newValue;
                              return updatedEffect;
                            });
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

export default Craft;
