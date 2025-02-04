import { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "../../components/modal";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../hooks/useAlert";
import { CraftMetas } from "../../metadatas/metadatas";

interface CraftMaterial {
  id: number;
  marketName: string;
  grade: string;
  marketId: number;
  subCode: number;
  iconLink: string;
  bundleCount: number;
  quantity: number;
  currentMinPrice?: number;
  ydayAvgPrice?: number;
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
  craftMaterials: CraftMaterial[]; //제작 재료
  ydayAvgPrice: number; //전날 평균 가격
  tradeCount: number; //거래량
  craft: {
    craftPriceAll: number; //전체 제작 비용
    craftSellPrice: number; //판매 차익
    craftCostMargin: number; //원가이
  };
  ydayCraft: {
    ydayCraftPriceAll: number; //전날 전체 제작 비용
    ydayCraftSellPrice: number; //전날 판매 차익
    ydayCraftCostMargin: number; //전날 원가이익률
  };
  convert?: {
    convertCraftPriceAll: number; //변환 제작 비용
    convertCraftSellPrice: number; //변환 판매 차익
    convertCraftCostMargin: number; //변환 원가이익률
  };
  ydayConvert?: {
    ydayConvertCraftPriceAll: number; //전날 변환 제작 비용
    ydayConvertCraftSellPrice: number; //전날 변환 판매 차익
    ydayConvertCraftCostMargin: number; //전날 변환 원가이익률
  };
}

//생활재료 가격 타입
interface Material {
  [key: string]: MaterialItem[];
}

interface MaterialItem {
  marketId: number;
  marketName: string;
  currentMinPrice: number;
  ydayAvgPrice: number;
  // originalMinPrice: number; // 기존 최저가 백업
  grade: string;
  convert?: {
    convertPrice: number;
    convertMaterial: MaterialItem;
  };
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

function CraftTest() {
  const alertBox = useAlert();

  const [craftList, setCraftList] = useState<CraftItem[]>([]);
  const [craftModalOpen, setCraftModalOpen] = useState(false);
  const [craftEffect, setCraftEffect] = useState<CraftEffect>(getInitialCraftEffect);
  const [categoryMenu, setCategoryMenu] = useState<boolean[]>(() => JSON.parse(localStorage.getItem("categoryMenu") || `[false, false, false, false, false, false, false, false]`));
  const [searchName, setSearchName] = useState<string>("");
  const [materialList, setMaterialList] = useState<Material>();
  //시세 기준 (현재 최저가 : currentMinPrice, 전날가격 : ydayAvgPrice )
  const [priceStandard, setPriceStandard] = useState<string>(() => JSON.parse(localStorage.getItem("priceStandard") || `"currentMinPrice"`));
  const [convert, setConvert] = useState<string>(() => JSON.parse(localStorage.getItem("convert") || `"convert"`));

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
    axios(`${import.meta.env.VITE_APP_API_URL}/api/v1/craft/readDataAll`)
      .then((res) => {
        setCraftList(res.data.craftItemList);
        setMaterialList(materialConversion(res.data.제작재료시세));
      })
      .catch((err) => {
        alertBox("목록을 불러오는데 실패했습니다.");
        console.error(err);
      });
  }

  // 컴포넌트가 마운트될 때 `getCraftList` 함수를 호출
  useEffect(() => {
    getCraftList();
  }, []);

  useEffect(() => {
    if (!craftList) return;
    const updatedCraftList = craftList.map((craft: CraftItem) => {
      return {
        ...craft,
        ...calculateCraftValues(craft),
      };
    });
    setCraftList(updatedCraftList);
  }, [materialList]);

  // craftEffect 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("craftEffect", JSON.stringify(craftEffect));
  }, [craftEffect]);

  //
  useEffect(() => {
    localStorage.setItem("priceStandard", JSON.stringify(priceStandard));
  }, [priceStandard]);

  useEffect(() => {
    localStorage.setItem("convert", JSON.stringify(convert));
  }, [convert]);

  useEffect(() => {
    localStorage.setItem("categoryMenu", JSON.stringify(categoryMenu));
  }, [categoryMenu]);

  //판매량 순위 계산
  const [tradeRank, setTradeRank] = useState<CraftItem[]>([]);
  //표시할 판매량 순위 조정 변수
  const [tradeRankCount, setTradeRankCount] = useState<number>(20);
  useEffect(() => {
    // marketName이 같은 항목을 제거
    const uniqueCraftList = craftList.filter((item, index, self) => index === self.findIndex((t) => t.marketName === item.marketName));

    // tradeCount에 따라 정렬
    const sortedList: CraftItem[] = [...uniqueCraftList];
    sortedList.sort((a, b) => b.tradeCount * b.bundleCount - a.tradeCount * a.bundleCount);

    setTradeRank(sortedList);
  }, [craftList]);

  const materialConversion = (materials: Material): Material => {
    const updatedMaterials = { ...materials };

    for (const materialKey in updatedMaterials) {
      // 기존 데이터의 convertPrice와 convertMaterial 필드를 제거
      if (materialKey[0] !== "9") continue;

      const material = updatedMaterials[materialKey];

      // 아비도스 교환 비율 계산 후 저장
      let grade1 = (material[0].currentMinPrice / 8) * 100; // 일반 100개 -> 가루 80개
      let grade2 = (material[1].currentMinPrice / 8) * 50; // 고급 50개 -> 가루 80개

      // 생활 재료 교환 탭
      if (materialKey === "90400" || materialKey === "90300") {
        const gradeConvert1 = material[0].currentMinPrice * 10;
        const gradeConvert2 = material[1].currentMinPrice * 5;

        //고급이 제일 저렴한 경우
        if (gradeConvert2 < gradeConvert1 && gradeConvert2 < material[2].currentMinPrice) {
          grade1 = (material[1].currentMinPrice / 8) * 50;
          updatedMaterials[materialKey][0] = {
            ...material[0],
            convert: {
              convertMaterial: material[1],
              convertPrice: material[1].currentMinPrice / 2,
            },
          };
        }

        //희귀가 제일 저렴한 경우
        if (material[2].currentMinPrice < gradeConvert2 && material[2].currentMinPrice < gradeConvert1) {
          grade1 = (material[2].currentMinPrice / 8) * 10;
          updatedMaterials[materialKey][0] = {
            ...material[0],
            convert: {
              convertMaterial: material[2],
              convertPrice: material[2].currentMinPrice / 10,
            },
          };
        }

        //고급과 희귀가 같은 경우
        if (gradeConvert2 === material[2].currentMinPrice) {
          grade1 = (material[1].currentMinPrice / 8) * 50;
          updatedMaterials[materialKey][0] = {
            ...material[0],
            convert: {
              convertMaterial: material[1],
              convertPrice: material[1].currentMinPrice / 2,
            },
          };
        }

        // if (material[0].currentMinPrice * 10 > material[2].currentMinPrice) {
        //   grade1 = (material[2].currentMinPrice / 8) * 10;
        //   updatedMaterials[materialKey][0] = {
        //     ...material[0],
        //     convert: {
        //       convertMaterial: material[2],
        //       convertPrice: material[2].currentMinPrice / 10,
        //     },
        //   };
        // }

        // if (material[0].currentMinPrice * 2 > material[1].currentMinPrice && !(material[0].currentMinPrice * 10 > material[2].currentMinPrice)) {
        //   grade1 = (material[1].currentMinPrice / 8) * 50;
        //   updatedMaterials[materialKey][0] = {
        //     ...material[0],
        //     convert: {
        //       convertMaterial: material[1],
        //       convertPrice: material[1].currentMinPrice / 2,
        //     },
        //   };
        // }
      }
      // 일반, 고급 재료 중 아비도스 보다 저렴한 재료를 반환
      if (grade1 < material[3].currentMinPrice || grade2 < material[3].currentMinPrice) {
        updatedMaterials[materialKey][3] = {
          ...material[3],
          convert: {
            convertMaterial: grade1 < grade2 ? material[0] : material[1],
            convertPrice: grade1 < grade2 ? grade1 : grade2,
          },
        };
      }

      // 고고학, 낚시, 수렵의 경우
      if (materialKey === "90700" || materialKey === "90600" || materialKey === "90500") {
        if (grade1 < material[2].currentMinPrice || grade2 < material[2].currentMinPrice) {
          updatedMaterials[materialKey][2] = {
            ...material[2],
            convert: {
              convertMaterial: grade1 < grade2 ? material[0] : material[1],
              convertPrice: grade1 < grade2 ? grade1 : grade2,
            },
          };
        }
      }
    }
    return updatedMaterials;
  };

  //제작 비용 계산 및 판매 차익 계산
  function calculateCraftValues(craftItem: CraftItem) {
    let craftTotalMaterialCost: number = 0;
    let convertTotalMaterialCost: number = 0;

    //총 제작비용 계산
    craftItem.craftMaterials.forEach((material) => {
      // 재료가 없는 경우
      if (!materialList) return;

      //만약 생활 재료가 아닌 경우 배템으로 계산

      // 재료 가격 찾기
      let findMaterial = materialList[material.subCode]?.find((item) => item.marketId === material.marketId);
      if (!findMaterial) return;

      // 최저가로 계산
      const craftCost = findMaterial.currentMinPrice;
      craftTotalMaterialCost += (craftCost / material.bundleCount) * material.quantity;

      // 변환 가격이 있는 경우 변환 가격으로 계산 없으면 일반 재료 가격으로 계산
      if (findMaterial.convert) {
        const convertCost = findMaterial.convert.convertPrice;
        convertTotalMaterialCost += (convertCost / material.bundleCount) * material.quantity;
      } else {
        convertTotalMaterialCost += (craftCost / material.bundleCount) * material.quantity;
      }
    });

    //제작 수수료감소 적용 및 추가 비용 계산 소수점 2자리까지
    const craftPriceAll = Math.floor((craftTotalMaterialCost + craftItem.craftPrice * (1 - 0.01 * (craftEffect["제작수수료 감소"][0] + craftEffect["제작수수료 감소"][craftItem.category]))) * 100) / 100;
    const ydayCraftPriceAll = craftPriceAll;
    const convertCraftPriceAll = Math.floor((convertTotalMaterialCost + craftItem.craftPrice * (1 - 0.01 * (craftEffect["제작수수료 감소"][0] + craftEffect["제작수수료 감소"][craftItem.category]))) * 100) / 100;
    const ydayConvertCraftPriceAll = convertCraftPriceAll;

    const defaultSellPrice = craftItem.currentMinPrice - Math.ceil(craftItem.currentMinPrice * 0.05);
    const ydaySellPrice = Math.ceil(craftItem.ydayAvgPrice) - Math.ceil(Math.ceil(craftItem.ydayAvgPrice) * 0.05);

    //기본 시세 판매 차익 및 원가이익률 계산
    const craftSellPrice = Math.ceil((craftItem.craftQuantity * (defaultSellPrice / craftItem.bundleCount) - craftPriceAll) * 100) / 100;
    const craftCostMargin = Math.round((craftSellPrice / (craftItem.currentMinPrice * (craftItem.craftQuantity / craftItem.bundleCount) - craftSellPrice)) * 10000) / 100;

    //전날 시세 판매 차익 및 원가이익률 계산
    const ydayCraftSellPrice = Math.ceil((craftItem.craftQuantity * (ydaySellPrice / craftItem.bundleCount) - craftPriceAll) * 100) / 100;
    const ydayCraftCostMargin = Math.round((ydayCraftSellPrice / (craftItem.ydayAvgPrice * (craftItem.craftQuantity / craftItem.bundleCount) - ydayCraftSellPrice)) * 10000) / 100;

    //변환 시세 판매 차익 및 원가이익률 계산
    const convertCraftSellPrice = Math.ceil((craftItem.craftQuantity * (defaultSellPrice / craftItem.bundleCount) - convertCraftPriceAll) * 100) / 100;
    const convertCraftCostMargin = Math.round((convertCraftSellPrice / (craftItem.currentMinPrice * (craftItem.craftQuantity / craftItem.bundleCount) - convertCraftSellPrice)) * 10000) / 100;
    //기본 재료

    const ydayConvertCraftSellPrice = Math.ceil((craftItem.craftQuantity * (ydaySellPrice / craftItem.bundleCount) - convertCraftPriceAll) * 100) / 100;
    const ydayConvertCraftCostMargin = Math.round((ydayConvertCraftSellPrice / (craftItem.ydayAvgPrice * (craftItem.craftQuantity / craftItem.bundleCount) - ydayConvertCraftSellPrice)) * 10000) / 100;

    return {
      craft: {
        craftPriceAll,
        craftSellPrice,
        craftCostMargin,
      },
      ydayCraft: {
        ydayCraftPriceAll,
        ydayCraftSellPrice,
        ydayCraftCostMargin,
      },
      convert: {
        convertCraftPriceAll,
        convertCraftSellPrice,
        convertCraftCostMargin,
      },
      ydayConvert: {
        ydayConvertCraftPriceAll,
        ydayConvertCraftSellPrice,
        ydayConvertCraftCostMargin,
      },
    };
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
  }, [craftEffect]);

  //sort에 따라 정렬
  //convert가 변환시세로 설정되어 있으면 변환시세로 계산
  //priceStandard가 전날가격으로 설정되어 있으면 전날가격으로 계산
  useEffect(() => {
    const sortedList: CraftItem[] = [...craftList];
    sortedList.sort((a, b) => {
      //현재 최저가, 변환 시세, 판매차익
      if (priceStandard === "currentMinPrice" && convert === "convert" && sort === "craftSellPrice" && b?.convert?.convertCraftSellPrice && a?.convert?.convertCraftSellPrice) {
        return b?.convert?.convertCraftSellPrice - a?.convert?.convertCraftSellPrice;
      }

      //현재 최저가, 변호 시세, 원가이익률
      else if (priceStandard === "currentMinPrice" && convert === "convert" && sort === "craftCostMargin" && b?.convert?.convertCraftCostMargin && a?.convert?.convertCraftCostMargin) {
        return b?.convert?.convertCraftCostMargin - a?.convert?.convertCraftCostMargin;
      }

      //현재 최저가, 기본 시세, 판매차익
      else if (priceStandard === "currentMinPrice" && convert === "default" && sort === "craftSellPrice") {
        return b?.craft?.craftSellPrice - a?.craft?.craftSellPrice;
      }

      //현재 최저가, 기본 시세, 원가이익률
      else if (priceStandard === "currentMinPrice" && convert === "default" && sort === "craftCostMargin") {
        return b?.craft?.craftCostMargin - a?.craft?.craftCostMargin;
      }

      //전날 평균가, 변환 시세, 판매차익
      else if (priceStandard === "ydayAvgPrice" && convert === "convert" && sort === "craftSellPrice" && b?.ydayConvert?.ydayConvertCraftSellPrice && a?.ydayConvert?.ydayConvertCraftSellPrice) {
        return b?.ydayConvert?.ydayConvertCraftSellPrice - a?.ydayConvert?.ydayConvertCraftSellPrice;
      }

      //전날 평균가, 변환 시세, 원가이익률
      else if (priceStandard === "ydayAvgPrice" && convert === "convert" && sort === "craftCostMargin" && b?.ydayConvert?.ydayConvertCraftCostMargin && a?.ydayConvert?.ydayConvertCraftCostMargin) {
        return b?.ydayConvert?.ydayConvertCraftCostMargin - a?.ydayConvert?.ydayConvertCraftCostMargin;
      }

      //전날 평균가, 기본 시세, 판매차익
      else if (priceStandard === "ydayAvgPrice" && convert === "default" && sort === "craftSellPrice") {
        return b?.ydayCraft?.ydayCraftSellPrice - a?.ydayCraft?.ydayCraftSellPrice;
      }

      //전날 평균가, 기본 시세, 원가이익률
      else if (priceStandard === "ydayAvgPrice" && convert === "default" && sort === "craftCostMargin") {
        return b?.ydayCraft?.ydayCraftCostMargin - a?.ydayCraft?.ydayCraftCostMargin;
      }
      return 0;
    });
    setSortedCraftList(sortedList);
  }, [sort, craftList, convert, priceStandard]);
  const [favoriteList, setFavoriteList] = useState<string[]>(() => JSON.parse(localStorage.getItem("favoriteList") || "[]"));

  //즐겨찾기 on/off를 markketName을 localStorage에 저장 함수
  const toggleFavorite = (marketName: string) => {
    const updatedFavoriteList = [...favoriteList];
    const index = updatedFavoriteList.indexOf(marketName);
    if (index === -1) {
      updatedFavoriteList.push(marketName);
    } else {
      updatedFavoriteList.splice(index, 1);
    }
    setFavoriteList(updatedFavoriteList);
    localStorage.setItem("favoriteList", JSON.stringify(updatedFavoriteList));
  };

  const handleIconClick = (event: React.MouseEvent, marketName: string) => {
    event.stopPropagation(); // 이벤트 버블링 방지
    toggleFavorite(marketName);
  };

  return (
    <div className="sm:text-sm text-xs w-full h-full flex justify-center gap-4 font-semibold xl:flex-row flex-col xl:items-start items-center p-2">
      <CraftMetas></CraftMetas>
      {/* 카테고리 버튼 관심, 특수, 물약, 폭탄, 수류탄, 로브, 기타, 음식, */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col justify-center items-start content-box p-4 gap-4 ">
          <span className="sm:text-base text-sm font-semibold">카테고리</span>
          <div className="w-full grid grid-cols-4 gap-2 ">
            {["관심", "특수", "물약", "폭탄", "수류탄", "로브", "기타", "요리"].map((category, index) => {
              //카테고리 버튼 클릭시 해당 카테고리의 메뉴를 토글
              //전체 클릭시 모든 메뉴 토글 해제
              //전체를 제외한 나머지 카테고리를 클릭시 전체 메뉴 토글 해제
              return (
                <button
                  key={category}
                  onClick={() => {
                    if (index === 0) {
                      if (categoryMenu[0] === true) setCategoryMenu([false, false, false, false, false, false, false, false]);
                      else setCategoryMenu([true, false, false, false, false, false, false, false]);
                    } else {
                      let temp = [...categoryMenu];
                      //관심만 토글된 상태에서 다른 카테고리 클릭시 관심 토글 해제
                      //관심만 토글된 상태에서 관심을 클릭시 관심 토글 해제
                      if (temp[0] === true && temp.slice(1).every((item) => item === false)) {
                        temp[0] = false;
                      }
                      temp[index] = !temp[index];
                      setCategoryMenu(temp);

                      // if (temp.slice(1).every((item) => item === false)) {
                      //   setCategoryMenu([true, false, false, false, false, false, false, false]);
                      // }
                    }
                  }}
                  className={`flexCC text-nowrap py-2 px-4 rounded-md ${categoryMenu[index] ? "active-btn" : "default-btn"}`}>
                  {category}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-4 content-box xl:block hidden">
          <div className="flex justify-start items-center mb-2 gap-4">
            <div className="sm:text-base text-sm font-semibold ">전날 판매량 순위</div>
            <div className="flex justify-start items-center gap-3">
              {[10, 20, 30, 40].map((count) => {
                return (
                  <button key={count} onClick={() => setTradeRankCount(count)} className={`rounded-sm px-1 ${tradeRankCount === count ? "active-btn" : "default-btn"}`}>
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
                    <span>{craft.marketName}</span>
                  </div>
                  <span>{(craft.tradeCount * craft.bundleCount).toLocaleString()}</span>
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
        <div className=" content-box grid md:grid-cols-8 gap-4 p-4 flex-wrap text-nowrap">
          <div className="relative flex justify-center items-center md:col-span-7 col-span-8 gap-2">
            <input onChange={(e) => setSearchName(e.target.value)} placeholder="제작법" type="text" className="grow h-10 content-box border-solid border rounded-md border-bddark p-4" />
            <i className="absolute right-2 xi-search xi-x"></i>
          </div>
          <button onClick={() => setCraftModalOpen(true)} className="md:col-span-1 flexCC col-span-8 py-2 px-4 btn">
            영지효과
          </button>
          <div className="flexCC grid grid-cols-2 md:col-span-4 col-span-8 gap-4">
            <span className="sm:text-base text-sm mr-2 font-bold flex justify-center items-center">판매시세</span>
            <div>
              <button onClick={() => setPriceStandard("currentMinPrice")} className={`w-28 py-2 px-4 rounded-l-md ${priceStandard === "currentMinPrice" ? "active-btn" : "default-btn "}`}>
                현재 최저가
              </button>
              <button onClick={() => setPriceStandard("ydayAvgPrice")} className={`w-28 py-2 px-4 rounded-r-md ${priceStandard === "ydayAvgPrice" ? "active-btn" : "default-btn"}`}>
                전날 평균가
              </button>
            </div>
          </div>
          <div className="flexCC grid grid-cols-2 md:col-span-4 col-span-8 gap-4">
            <span className="sm:text-base text-sm mr-2 font-bold flex justify-center items-center">생활재료</span>
            <div>
              <button onClick={() => setConvert("convert")} className={`w-28 py-2 px-4 rounded-l-md ${convert === "convert" ? "active-btn" : "default-btn "}`}>
                변환 시세
              </button>
              <button onClick={() => setConvert("default")} className={`w-28 py-2 px-4 rounded-r-md ${convert === "default" ? "active-btn" : "default-btn "}`}>
                기본 시세
              </button>
            </div>
          </div>
        </div>

        {/* 제작품 목록 */}
        <div className="sm:max-w-[1200px] p-4 content-box text-center flex flex-col  justify-center flex-wrap">
          <div className="grid md:grid-cols-[0.1fr_3fr_1fr_1fr_1fr_0.8fr_0.5fr_0.5fr] sm:grid-cols-[0.1fr_1fr_1fr_1fr_1fr_0.8fr_0.5fr_0.5fr] grid-cols-[0.1fr_1fr_1fr_1fr_0.8fr_0.5fr_0.5fr] sm:gap-4 gap-3 py-2 sm:px-4 text-nowrap">
            <span></span>
            <span>제작법</span>
            <span className="flex justify-end items-center">{priceStandard === "currentMinPrice" ? "현재 최저가" : "전날 평균가"}</span>
            {/* <span>최저가</span> */}
            <span className="sm:flex hidden justify-end items-center">제작비용</span>
            <button className={"flex justify-end items-center gap-1 " + `${sort === "craftSellPrice" ? "text-green-500" : null}`} onClick={() => setSort("craftSellPrice")}>
              <span className="flex justify-center items-center">판매차익</span>
              <i className="xi-caret-down-min"></i>
            </button>
            <button className={"flex justify-end items-center gap-1 " + `${sort === "craftCostMargin" ? "text-green-500" : null}`} onClick={() => setSort("craftCostMargin")}>
              <span className={`flex justify-center items-center `}>이익률</span>
              <i className="xi-caret-down-min"></i>
            </button>
            <span>사용</span>
            <span>판매</span>
          </div>

          {sortedCraftList.map((craft: CraftItem) => {
            //제작법 이름 검색(내용이 없으면 전부 표시)
            if (searchName !== "" && !craft.craftName.includes(searchName)) return null;
            //관심목록만 표시
            if (categoryMenu[0] && favoriteList.indexOf(craft.craftName) === -1) return null;

            //카테고리 메뉴에서 전체가 아닌 경우 해당 카테고리만 표시
            if (!categoryMenu[0] && !categoryMenu[craft.category] && !categoryMenu.every((boolean) => boolean === false)) return null;

            //특정 제작법 제외
            const filter = ["빛나는 신호탄", "빛나는 진군의 깃발", "빛나는 신속 로브", "빛나는 화염 수류탄", "빛나는 점토 수류탄"];
            if (filter.indexOf(craft.craftName) > -1) return null;

            return (
              <div
                onClick={() => navigate(`/craft/${craft.id}`)}
                className="cursor-pointer hover:bg-hover dark:hover:bg-gray-700 transition-all grid md:grid-cols-[0.1fr_3fr_1fr_1fr_1fr_0.8fr_0.5fr_0.5fr] sm:grid-cols-[0.1fr_1fr_1fr_1fr_1fr_0.8fr_0.5fr_0.5fr] grid-cols-[0.1fr_1fr_1fr_1fr_0.8fr_0.5fr_0.5fr] sm:gap-4 gap-3 border-t border-solid border-bddark py-2 sm:px-4 "
                key={craft.id}>
                {/*관심 */}
                <i onClick={(event) => handleIconClick(event, craft.craftName)} className={"xi-star sm:p-2 p-1 flex justify-center items-center " + `${favoriteList.indexOf(craft.craftName) > -1 ? "text-yellow-400" : ""}`}></i>
                {/* 이미지 및 제작 이름  */}
                <div className=" flex md:justify-start justify-center items-center gap-4 ">
                  <div className="relative">
                    <img src={craft.iconLink} alt={craft.craftName} className={"w-10 h-10 " + `${grade[craft.grade]}`} />
                    <div className="text-xs font-semibold absolute right-[0.125rem] bottom-0 text-white">{craft.craftQuantity}</div>
                  </div>
                  <span className="font-semibold md:block hidden">{craft.craftName}</span>
                </div>
                {/* 최저가 */}
                <div className="sm:gap-2 gap-1 flex items-center justify-end text-center font-semibold">
                  <div>{priceStandard === "currentMinPrice" ? craft.currentMinPrice : Math.ceil(craft.ydayAvgPrice)}</div>
                  <img className="sm:w-5 sm:h-5 w-4 h-4" src="/itemIcon/gold.webp" alt="gold" />
                </div>
                {/* 제작비용 */}
                <div className="sm:flex hidden gap-2 items-center justify-end text-center font-semibold">
                  <div>{craft?.craft?.craftPriceAll}</div>
                  <img className="sm:w-5 sm:h-5 w-4 h-4" src="/itemIcon/gold.webp" alt="gold" />
                </div>

                {/* 판매 차익 */}
                <span className={"flex sm:gap-2 gap-1 items-center justify-end font-semibold"}>
                  {convert === "default" ? (
                    <div>{priceStandard === "currentMinPrice" ? craft?.craft?.craftSellPrice : craft?.ydayCraft?.ydayCraftSellPrice}</div>
                  ) : (
                    <div>{priceStandard === "currentMinPrice" ? craft?.convert?.convertCraftSellPrice : craft?.ydayConvert?.ydayConvertCraftSellPrice}</div>
                  )}
                  <img className="sm:w-5 sm:h-5 w-4 h-4" src="/itemIcon/gold.webp" alt="gold" />
                </span>
                {/* 원가이익률(%) */}
                <span className={"flex gap-1  items-center justify-end font-semibold"}>
                  {convert === "default" ? (
                    <div className="">{priceStandard === "currentMinPrice" ? craft?.craft?.craftCostMargin : craft?.ydayCraft?.ydayCraftCostMargin}</div>
                  ) : (
                    <div className="">{priceStandard === "currentMinPrice" ? craft?.convert?.convertCraftCostMargin : craft?.ydayConvert?.ydayConvertCraftCostMargin}</div>
                  )}
                  <div>%</div>
                </span>
                {/* 사용 */}
                {convert === "default" ? (
                  priceStandard === "currentMinPrice" ? (
                    craft.currentMinPrice * craft.craftQuantity - craft?.craft?.craftPriceAll > 0 ? (
                      <span className={"flex items-center justify-center text-red-400 font-semibold"}>이득</span>
                    ) : (
                      <span className={"flex items-center justify-center text-blue-400 font-semibold"}>손해</span>
                    )
                  ) : craft.ydayAvgPrice * craft.craftQuantity - craft?.ydayCraft?.ydayCraftPriceAll > 0 ? (
                    <span className={"flex items-center justify-center text-red-400 font-semibold"}>이득</span>
                  ) : (
                    <span className={"flex items-center justify-center text-blue-400 font-semibold"}>손해</span>
                  )
                ) : priceStandard === "currentMinPrice" ? (
                  craft.currentMinPrice * craft.craftQuantity - (craft?.convert?.convertCraftPriceAll ?? 0) > 0 ? (
                    <span className={"flex items-center justify-center text-red-400 font-semibold"}>이득</span>
                  ) : (
                    <span className={"flex items-center justify-center text-blue-400 font-semibold"}>손해</span>
                  )
                ) : craft.ydayAvgPrice * craft.craftQuantity - (craft?.ydayConvert?.ydayConvertCraftPriceAll ?? 0) > 0 ? (
                  <span className={"flex items-center justify-center text-red-400 font-semibold"}>이득</span>
                ) : (
                  <span className={"flex items-center justify-center text-blue-400 font-semibold"}>손해</span>
                )}

                {/* 판매 */}
                {convert === "default" ? (
                  priceStandard === "currentMinPrice" ? (
                    craft?.craft?.craftSellPrice > 0 ? (
                      <span className={"flex items-center justify-center text-red-400 font-semibold"}>이득</span>
                    ) : (
                      <span className={"flex items-center justify-center text-blue-400 font-semibold"}>손해</span>
                    )
                  ) : craft?.ydayCraft?.ydayCraftSellPrice > 0 ? (
                    <span className={"flex items-center justify-center text-red-400 font-semibold"}>이득</span>
                  ) : (
                    <span className={"flex items-center justify-center text-blue-400 font-semibold"}>손해</span>
                  )
                ) : priceStandard === "currentMinPrice" ? (
                  (craft?.convert?.convertCraftSellPrice ?? 0) > 0 ? (
                    <span className={"flex items-center justify-center text-red-400 font-semibold"}>이득</span>
                  ) : (
                    <span className={"flex items-center justify-center text-blue-400 font-semibold"}>손해</span>
                  )
                ) : (craft?.ydayConvert?.ydayConvertCraftSellPrice ?? 0) > 0 ? (
                  <span className={"flex items-center justify-center text-red-400 font-semibold"}>이득</span>
                ) : (
                  <span className={"flex items-center justify-center text-blue-400 font-semibold"}>손해</span>
                )}

                {/* {craft.currentMinPrice * craft.craftQuantity - craft?.craft?.craftPriceAll > 0 ? <span className={"flex items-center justify-center text-red-400 font-semibold"}>이득</span> : <span className={"flex items-center justify-center text-blue-400 font-semibold"}>손해</span>}
                {craft?.craft?.craftSellPrice > 0 ? <span className={"flex items-center justify-center text-red-400 font-semibold"}>이득</span> : <span className={"flex items-center justify-center text-blue-400 font-semibold"}>손해</span>} */}
              </div>
            );
          })}
        </div>
      </div>

      {/* 영지 효과 입력창 - x열 제작수수료 감소, 활동력 감소, y열 전체, 특수, 물약, 폭탄, 수류탄, 로브, 기타 배템, 요리 */}
      <Modal isOpen={craftModalOpen} onClose={() => setCraftModalOpen(false)}>
        <div className="content-box p-8 flex flex-col gap-4 rounded-md">
          {["제작수수료 감소", "제작시간 감소", "활동력 감소"].map((effect: string) => {
            return (
              <div key={effect} className="flex flex-col gap-3">
                <span className="sm:text-base text-sm font-semibold">{effect}</span>
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
          <button
            onClick={() => {
              setCraftModalOpen(false);
            }}
            className="mt-4 h-10 btn w-full">
            닫기
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default CraftTest;
