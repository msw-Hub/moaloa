import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import itemIcon from "../../data/itemIcon.json";
import { Modal } from "../../components/modal";

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
  convertPrice: number;
  originalMinPrice: number; // 기존 최저가 백업
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
  convertCraftPriceAll: number; //변환 제작 비용
  convertCraftSellPrice: number; //변환 판매 차익
  convertCraftCostMargin: number; //변환 원가이익률
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
  originalMinPrice: number; // 기존 최저가 백업
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

function CraftDetail() {
  // URL 파라미터 값 가져오기\
  const goldIcon = "/itemIcon/gold.webp";
  const { id } = useParams();

  const [craftModalOpen, setCraftModalOpen] = useState(false);
  //시세 기준 (현재 최저가 : currentMinPrice, 전날가격 : ydayAvgPrice )
  const [priceStandard, setPriceStandard] = useState<string>("currentMinPrice");
  const [craftDetail, setCraftDetail] = useState<CraftItem>();
  const [materialList, setMaterialList] = useState<Material>();
  const [craftEffect, setCraftEffect] = useState<CraftEffect>(getInitialCraftEffect);
  const [time, setTime] = useState<number>(0);
  const [convert, setConvert] = useState<string>("convert");
  const [isFirstRun, setIsFirstRun] = useState<boolean>(true);

  useEffect(() => {
    calculateCraftPriceAll();
  }, [craftEffect, priceStandard, materialList]);

  useEffect(() => {
    getMaterialPrice();
  }, []);
  useEffect(() => {
    getCraftDetail();
  }, [id]);

  useEffect(() => {
    console.log(materialList);
  }, [materialList]);

  useEffect(() => {
    if (craftDetail && materialList && isFirstRun) {
      calculateCraftPriceAll();
      setIsFirstRun(false);
    }
  }, [craftDetail, materialList]);

  function getCraftDetail() {
    axios
      .get(`/api/v1/craft/readData?craftItemId=${id}`)
      .then((res) => {
        // const updatedCraftList = calculateCraftValues(res.data["제작아이템"]);
        setCraftDetail(res.data["제작아이템"]);

        setTime(res.data.갱신시간);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function getMaterialPrice() {
    axios
      .get("/api/v1/craft/readLifeData")
      .then((res) => {
        const updatedMaterialList = materialConversion(res.data["생활재료시세"]);
        //originalMinPrice 추가
        for (const materialKey in updatedMaterialList) {
          if (materialKey === "식물채집" || materialKey === "벌목" || materialKey === "채광" || materialKey === "수렵" || materialKey === "낚시" || materialKey === "고고학") {
            updatedMaterialList[materialKey] = updatedMaterialList[materialKey].map((a) => {
              return { ...a, originalMinPrice: a.currentMinPrice };
            });
          }
        }
        setMaterialList(updatedMaterialList);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //생활재료 가격 수정에 onchange 이벤트 / 입력시 materialList currentMinPrice 과 craftDetail 재료정보의 currentMinPrice를 변경
  function onMaterialPriceChange(e: React.ChangeEvent<HTMLInputElement>, marketId: number) {
    if (!materialList || !craftDetail) return;

    const updatedMaterials: Material = { ...materialList };

    for (const materialKey in updatedMaterials) {
      if (materialKey === "식물채집" || materialKey === "벌목" || materialKey === "채광" || materialKey === "수렵" || materialKey === "낚시" || materialKey === "고고학") {
        updatedMaterials[materialKey] = updatedMaterials[materialKey].map((a) => {
          const { convertPrice, convertMaterial, ...rest } = a;
          return { ...rest }; // 새로운 객체 생성
        });
        if (updatedMaterials[materialKey]) {
          updatedMaterials[materialKey] = updatedMaterials[materialKey].map((a) => {
            if (a.marketId === marketId) {
              return {
                ...a,
                currentMinPrice: Number(e.target.value),
              };
            }
            return a;
          });
        }
      }
    }

    setMaterialList(materialConversion(updatedMaterials));

    const updatedCraftMaterials = craftDetail.craftMaterials.map((material) => {
      if (material.marketId === marketId) {
        return {
          ...material,
          currentMinPrice: Number(e.target.value),
        };
      }
      return material;
    });

    const updatedCraftDetail = {
      ...craftDetail,
      craftMaterials: updatedCraftMaterials,
    };

    const updatedCraftValues = calculateCraftValues(updatedCraftDetail);
    setCraftDetail({ ...updatedCraftDetail, ...updatedCraftValues });
  }

  function materialConversion(materials: Material): Material {
    const updatedMaterials = { ...materials };

    for (const materialKey in updatedMaterials) {
      if (materialKey === "식물채집" || materialKey === "벌목" || materialKey === "채광" || materialKey === "수렵" || materialKey === "낚시" || materialKey === "고고학") {
        // 기존 데이터의 convertPrice와 convertMaterial 필드를 제거

        const material = updatedMaterials[materialKey];

        // 아비도스 교환 비율 계산 후 저장
        let grade1 = (material[0].currentMinPrice / 8) * 100; // 일반 100개 -> 가루 80개
        let grade2 = (material[1].currentMinPrice / 8) * 50; // 고급 50개 -> 가루 80개

        // 생활 재료 교환 탭
        if (materialKey === "채광" || materialKey === "벌목") {
          if (material[0].currentMinPrice * 10 > material[2].currentMinPrice) {
            grade1 = (material[2].currentMinPrice / 8) * 10;
            updatedMaterials[materialKey][0] = {
              ...material[0],
              convertMaterial: material[2],
              convertPrice: material[2].currentMinPrice / 10,
            };
          }

          if (material[0].currentMinPrice * 2 > material[1].currentMinPrice && !(material[0].currentMinPrice * 10 > material[2].currentMinPrice)) {
            grade1 = (material[1].currentMinPrice / 8) * 50;
            updatedMaterials[materialKey][0] = {
              ...material[0],
              convertMaterial: material[1],
              convertPrice: material[1].currentMinPrice / 2,
            };
          }
        }

        // 일반, 고급 재료 중 아비도스 보다 저렴한 재료를 반환
        if (grade1 < material[3].currentMinPrice || grade2 < material[3].currentMinPrice) {
          updatedMaterials[materialKey][3] = {
            ...material[3],
            convertMaterial: grade1 < grade2 ? material[0] : material[1],
            convertPrice: grade1 < grade2 ? grade1 : grade2,
          };
        }

        // 고고학, 낚시, 수렵의 경우
        if (materialKey === "고고학" || materialKey === "낚시" || materialKey === "수렵") {
          if (grade1 < material[2].currentMinPrice || grade2 < material[2].currentMinPrice) {
            updatedMaterials[materialKey][2] = {
              ...material[2],
              convertMaterial: grade1 < grade2 ? material[0] : material[1],
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
    let convertTotalMaterialCost = 0;

    let subCode: { [key: number]: string } = {
      90200: "식물채집",
      90300: "벌목",
      90400: "채광",
      90500: "수렵",
      90600: "낚시",
      90700: "고고학",
    };

    //craftMaterials에 convertPrice를 추가하여 변환 가격을 저장후 반환
    let craftMaterials = craftItem.craftMaterials.map((material) => {
      if (materialList && subCode[material.subCode]) {
        const materialCheck = materialList[subCode[material.subCode] as keyof Material];
        if (materialCheck) {
          const convertPrice = materialCheck.find((a) => a.marketId === material.marketId)?.convertPrice || material.currentMinPrice;
          return { ...material, convertPrice };
        }
      }
      return material;
    });

    craftItem.craftMaterials.forEach((material) => {
      if (materialList && subCode[material.subCode]) {
        const materialCheck = materialList[subCode[material.subCode] as keyof Material];
        if (materialCheck) {
          const convertPrice = materialCheck.find((a) => a.marketId === material.marketId)?.convertPrice || material.currentMinPrice;
          const totalMaterialCostForItem = (convertPrice / material.bundleCount) * material.quantity;
          convertTotalMaterialCost += totalMaterialCostForItem;
        }
      } else {
        const totalMaterialCostForItem = (material.currentMinPrice / material.bundleCount) * material.quantity;
        convertTotalMaterialCost += totalMaterialCostForItem;
      }
    });

    craftItem.craftMaterials.forEach((material) => {
      const totalMaterialCostForItem = (material.currentMinPrice / material.bundleCount) * material.quantity;
      totalMaterialCost += totalMaterialCostForItem;
    });

    let craftPriceAll;
    let convertCraftPriceAll;

    // 제작수수료 감소 효과 적용
    const totalCraftCost = totalMaterialCost + Math.floor(craftItem.craftPrice * (1 - 0.01 * (craftEffect["제작수수료 감소"][0] + craftEffect["제작수수료 감소"][craftItem.category])));
    craftPriceAll = Math.ceil(totalCraftCost * 100) / 100;

    const convertTotalCraftCost = convertTotalMaterialCost + Math.floor(craftItem.craftPrice * (1 - 0.01 * (craftEffect["제작수수료 감소"][0] + craftEffect["제작수수료 감소"][craftItem.category])));
    convertCraftPriceAll = Math.ceil(convertTotalCraftCost * 100) / 100;

    // if (craftItem.craftName === "아비도스 융화 재료(벌목)") console.log(totalCraftCost, totalMaterialCost, craftItem.craftPrice, craftEffect["제작수수료 감소"][0], craftEffect["제작수수료 감소"][craftItem.category]);
    // if (craftItem.craftName === "아비도스 융화 재료(벌목)") console.log(craftItem.craftPrice * (1 - 0.01 * (craftEffect["제작수수료 감소"][0] + craftEffect["제작수수료 감소"][craftItem.category])));
    // // 판매 차익 계산 수수료 5% 포함 소수점은 무조건 올림
    const priceStandardValue = Math.round(craftItem[priceStandard as keyof CraftItem] as number);
    if (typeof priceStandardValue === "number") {
      const sellPrice = priceStandardValue - Math.ceil(priceStandardValue * 0.05);
      const craftSellPrice = Math.ceil((craftItem.craftQuantity * (sellPrice / craftItem.bundleCount) - craftPriceAll) * 100) / 100;
      // 원가이익률 계산
      const craftCostMargin = Math.round((craftSellPrice / (priceStandardValue * craftItem.craftQuantity - craftSellPrice)) * 10000) / 100;

      const convertSellPrice = priceStandardValue - Math.ceil(priceStandardValue * 0.05);
      const convertCraftSellPrice = Math.ceil((craftItem.craftQuantity * (convertSellPrice / craftItem.bundleCount) - convertCraftPriceAll) * 100) / 100;
      // 원가이익률 계산
      const convertCraftCostMargin = Math.round((convertCraftSellPrice / (priceStandardValue * craftItem.craftQuantity - convertCraftSellPrice)) * 10000) / 100;
      return {
        craftPriceAll, // 제작 비용
        craftSellPrice, // 판매 차익
        craftCostMargin, // 원가이익률
        convertCraftPriceAll, // 변환 제작 비용
        convertCraftSellPrice, // 변환 판매 차익
        convertCraftCostMargin, // 변환 원가이익률
        craftMaterials, //재료 정보
      };
    } else {
      throw new Error(`Invalid priceStandard value: ${priceStandardValue}`);
    }
  }

  // 제작 비용
  function calculateCraftPriceAll() {
    if (!craftDetail) return;
    const updatedCraftList = calculateCraftValues(craftDetail);
    setCraftDetail({ ...craftDetail, ...updatedCraftList });
  }

  const grade: Grade = {
    일반: "imgBackground1",
    고급: "imgBackground2",
    희귀: "imgBackground3",
    영웅: "imgBackground4",
    전설: "imgBackground5",
    유물: "imgBackground6",
    고대: "imgBackground7",
  };

  const textColors: Grade = {
    일반: "",
    고급: "textColor2",
    희귀: "textColor3",
    영웅: "textColor4",
    전설: "textColor5",
    유물: "textColor6",
    고대: "textColor7",
  };

  return (
    craftDetail && (
      <div className="p-6 flex flex-col gap-6">
        <div className="flex flex-col justify-center items-center gap-4">
          <img className={grade[craftDetail.grade] + " w-20 h-20"} src={craftDetail.iconLink} alt="" />
          <h1 className={"text-2xl font-bold " + `${textColors[craftDetail.grade]}`}>{craftDetail.craftName}</h1>
          <p className="text-sm text-gray-500">갱신시간: {time}</p>
        </div>
        {/*판매 기준 설정, 재료정보 변환, 영지 효과 */}
        <div className="content-box p-2 grid md:grid-cols-2 grid-cols-1 gap-2">
          <div className="flex justify-center items-center gap-1">
            <span className="mr-2 font-bold">판매시세</span>
            <button onClick={() => setPriceStandard("currentMinPrice")} className={"btn font-medium py-2 px-4 rounded-md " + `${priceStandard == "currentMinPrice" ? "bg-[#e3e3e3] dark:bg-bgdark dark:text-white" : ""}`}>
              현재 최저가
            </button>
            <button onClick={() => setPriceStandard("ydayAvgPrice")} className={"btn font-medium py-2 px-4 rounded-md " + `${priceStandard == "ydayAvgPrice" ? "bg-[#e3e3e3] dark:bg-bgdark dark:text-white" : ""}`}>
              전날 평균 가격
            </button>
          </div>
          <div className="flex justify-center items-center gap-2">
            <span className="mr-2 font-bold">생활재료</span>
            <button onClick={() => setConvert("convert")} className={"btn font-medium py-2 px-4 rounded-md " + `${convert == "convert" ? "bg-[#e3e3e3] dark:bg-bgdark dark:text-white" : ""}`}>
              변환 시세
            </button>
            <button onClick={() => setConvert("default")} className={"btn font-medium py-2 px-4 rounded-md " + `${convert == "default" ? "bg-[#e3e3e3] dark:bg-bgdark dark:text-white" : ""}`}>
              기본 시세
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] grid-cols-2 gap-6">
          {/* 제작 정보 */}
          <div className="p-4 content-box">
            <h2 className="font-bold text-lg mb-4">제작 정보</h2>
            <div className="space-y-2 font-medium">
              <div className="flex justify-between items-center">
                <div>제작단위</div>
                <div>{craftDetail.craftQuantity}</div>
              </div>
              <div className="flex justify-between items-center">
                <div>활동력</div>
                <div>{craftDetail.activityPrice}</div>
              </div>
              <div className="flex justify-between items-center">
                <div>제작시간</div>
                <div>{craftDetail.craftTime} 초</div>
              </div>
              <div className="flex justify-between items-center">
                <div>경험치</div>
                <div>{craftDetail.exp} EXP</div>
              </div>
              <div className="flex justify-between items-center">
                <div>제작비용</div>
                <div className="flex justify-center items-center gap-1">
                  <div>{convert === "default" ? craftDetail.craftPriceAll : craftDetail.convertCraftPriceAll}</div>
                  <img className="w-5 h-5" src={goldIcon} alt="gold" />
                </div>
              </div>
            </div>
          </div>

          {/* 판매 정보 */}
          <div className="p-4 content-box">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-balance">판매 정보</h2>
              <button onClick={() => setCraftModalOpen(true)} className="text-balance py-1 px-4 font-semibold col-start-6 btn flex items-center justify-center border border-solid border-bddark rounded-md">
                영지효과
              </button>
            </div>
            <div className="space-y-2 font-medium">
              <div className="flex justify-between items-center">
                <div>판매단위</div>
                <div>{craftDetail.bundleCount}</div>
              </div>

              <div className="flex justify-between items-center">
                <div>시세</div>
                <div className="flex justify-center items-center gap-1">
                  <div>{priceStandard === "currentMinPrice" ? craftDetail?.currentMinPrice : Math.round(craftDetail?.ydayAvgPrice)}</div>
                  <img className="w-5 h-5" src={goldIcon} alt="gold" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>총 판매금액</div>
                <div className="flex items-center gap-1">
                  <div>{craftDetail.craftPriceAll + craftDetail.craftSellPrice}</div>
                  <img className="w-5 h-5" src={goldIcon} alt="gold" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>판매 차익</div>
                <div className="flex items-center gap-1">
                  <div>{convert === "default" ? craftDetail.craftSellPrice : craftDetail.convertCraftSellPrice}</div>
                  <img className="w-5 h-5" src={goldIcon} alt="gold" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>원가 이익률</div>
                <div>{convert === "default" ? craftDetail.craftCostMargin : craftDetail.convertCraftCostMargin}%</div>
              </div>
            </div>
          </div>
          {/* 생활재료 교환 정보 */}
          {/*채광 벌목만 일반등급중 currentMinPrice가 있으면 변환 */}
          <div className="p-4 content-box font-medium md:col-span-1 col-span-2">
            <h2 className="font-bold text-lg mb-4">생활재료 교환 정보</h2>
            <div className="grid grid-cols-3 gap-2">
              {craftDetail.craftMaterials
                .sort((a, b) => a.id - b.id)
                .map((material, index) => {
                  if (!materialList) return null;
                  const materialData: MaterialItem = Object.values(materialList)
                    .flat()
                    .find((a) => a.marketId === material.marketId);
                  // console.log(index, materialData);
                  if (!materialData) return null;
                  //목재, 철광석만 변환 가능
                  if (materialData.marketName === "목재" || materialData.marketName === "철광석") {
                    if (materialData.convertMaterial) {
                      return (
                        <React.Fragment key={index}>
                          <div className="flex items-center justify-start gap-2">
                            <div className="relative">
                              <img className={`w-10 h-10 ${grade[materialData.convertMaterial.grade]}`} src={itemIcon[materialData.convertMaterial.marketName as keyof typeof itemIcon]} alt="재료아이템" />
                              <span className="absolute bottom-0 right-0 text-xs font-semibold text-white">{materialData.convertMaterial.grade === "고급" ? 25 : 5}</span>
                            </div>
                            <span className={textColors[materialData.convertMaterial.grade]}>{materialData.convertMaterial.marketName}</span>
                          </div>
                          <i className="flex justify-center items-center xi-arrow-right"></i>
                          <div className="flex items-center justify-start gap-2">
                            <div className="relative">
                              <img className={`w-10 h-10 ${grade[materialData.grade]}`} src={itemIcon[materialData.marketName as keyof typeof itemIcon]} alt="재료아이템" />
                              <span className="absolute bottom-0 right-0 text-xs font-semibold text-white">50</span>
                            </div>
                            <span className={textColors[materialData.grade]}>{materialData.marketName}</span>
                          </div>
                        </React.Fragment>
                      );
                    }
                  }
                  //모든 재료 변환 가능 (아비도스, 오레하)
                  if (material.grade === "희귀" && material.marketName !== "진귀한 유물" && material.marketName !== "진귀한 가죽") {
                    const lastString = material.marketName.split(" ")[material.marketName.split(" ").length - 1];
                    if (materialData.convertMaterial) {
                      return (
                        <React.Fragment key={index}>
                          <div className="flex items-center justify-start gap-2">
                            <div className="relative">
                              <img className={`w-10 h-10 ${grade[materialData.convertMaterial.grade]}`} src={itemIcon[materialData.convertMaterial.marketName as keyof typeof itemIcon]} alt="재료아이템" />
                              <span className="absolute bottom-0 right-0 text-xs font-semibold text-white">{materialData.convertMaterial.grade === "고급" ? 50 : 100}</span>
                            </div>
                            <span className={textColors[materialData.convertMaterial.grade]}>{materialData.convertMaterial.marketName}</span>
                          </div>
                          <i className="flex justify-center items-center xi-arrow-right"></i>
                          <div className="flex items-center justify-start gap-2">
                            <div className="relative">
                              <img
                                className={`w-10 h-10 ${grade.일반}`}
                                src={itemIcon[lastString === "들꽃" ? "채집의 가루" : lastString === "철광석" ? "채광의 가루" : lastString === "목재" ? "벌목의 가루" : lastString === "생고기" ? "수렵의 가루" : lastString === "유물" ? "고고학의 가루" : "낚시의 가루"]}
                                alt="가루"
                              />
                              <span className="absolute bottom-0 right-0 text-xs font-semibold text-white">80</span>
                            </div>
                            <span>{lastString === "들꽃" ? "채집의 가루" : lastString === "철광석" ? "채광의 가루" : lastString === "목재" ? "벌목의 가루" : lastString === "생고기" ? "수렵의 가루" : lastString === "유물" ? "고고학의 가루" : "낚시의 가루"}</span>
                          </div>
                          <div className="flex justify-start items-center gap-2">
                            <div className="relative">
                              <img
                                className={`w-10 h-10 ${grade.일반}`}
                                src={itemIcon[lastString === "들꽃" ? "채집의 가루" : lastString === "철광석" ? "채광의 가루" : lastString === "목재" ? "벌목의 가루" : lastString === "생고기" ? "수렵의 가루" : lastString === "유물" ? "고고학의 가루" : "낚시의 가루"]}
                                alt="가루"
                              />
                              <span className="absolute bottom-0 right-0 text-xs font-semibold text-white">100</span>
                            </div>
                            <span>{lastString === "들꽃" ? "채집의 가루" : lastString === "철광석" ? "채광의 가루" : lastString === "목재" ? "벌목의 가루" : lastString === "생고기" ? "수렵의 가루" : lastString === "유물" ? "고고학의 가루" : "낚시의 가루"}</span>
                          </div>
                          <i className="flex justify-center items-center xi-arrow-right"></i>
                          <div className="flex justify-start items-center gap-2">
                            <div className="relative">
                              <img className={`w-10 h-10 ${grade[materialData.grade]}`} src={itemIcon[materialData.marketName as keyof typeof itemIcon]} alt="재료아이템" />
                              <span className="absolute bottom-0 right-0 text-xs font-semibold text-white">10</span>
                            </div>
                            <span className={textColors[materialData.grade]}>{materialData.marketName}</span>
                          </div>
                        </React.Fragment>
                      );
                    }
                  }
                })}
            </div>
          </div>
          <div className="p-4 content-box md:col-span-1 col-span-2">
            <h2 className="font-bold text-lg mb-4">생활재료 가격 수정</h2>
            <div className="flex flex-col">
              {craftDetail.craftMaterials
                .sort((a, b) => a.id - b.id)
                .map((material) => (
                  <React.Fragment key={material.id}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex justify-center items-center gap-2">
                        <img src={material.iconLink} alt={material.marketName} className={"w-10 h-10 " + `${grade[material.grade]}`} />
                        <span className={textColors[material.grade]}>{material.marketName}</span>
                      </div>
                      <input
                        onFocus={(e) => {
                          setTimeout(() => {
                            const length = e.target.value.length;
                            e.target.setSelectionRange(length, length);
                          }, 0);
                        }}
                        onChange={(e) => onMaterialPriceChange(e, material.marketId)}
                        defaultValue={material.currentMinPrice}
                        className="w-24 text-right p-2 bg-[#393939]"
                        type="text"
                      />
                    </div>
                    {
                      //marketName이 목재, 철광석이면 변환재료도 같이 표시
                      material.marketName === "목재" && (
                        <div className="flex justify-between items-center mb-2 order-2">
                          <div className="flex justify-center items-center gap-2">
                            <img src={itemIcon["튼튼한 목재"]} alt={"튼튼한 목재"} className={"w-10 h-10 " + `${grade["희귀"]}`} />
                            <span className={textColors["희귀"]}>튼튼한 목재</span>
                          </div>
                          <input
                            onFocus={(e) => {
                              setTimeout(() => {
                                const length = e.target.value.length;
                                e.target.setSelectionRange(length, length);
                              }, 0);
                            }}
                            onChange={(e) => onMaterialPriceChange(e, materialList?.벌목[2].marketId ?? 0)}
                            defaultValue={materialList?.벌목[2].currentMinPrice}
                            className="w-24 text-right p-2  bg-[#393939]"
                            type="text"
                          />
                        </div>
                      )
                    }
                  </React.Fragment>
                ))}
            </div>
          </div>
        </div>

        {/* 재료 정보 */}
        <div className="p-4 content-box">
          <h2 className="font-bold text-lg mb-4">재료 정보</h2>
          <div>
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 text-center font-bold mb-2">
              <div className="flex justify-start items-center">재료</div>
              <div className="flex justify-end items-center">단위</div>
              <div className="flex justify-end items-center">시세</div>
              <div className="flex justify-end items-center">개당 가격</div>
              <div className="flex justify-end items-center">총 비용</div>
            </div>
            <div className="flex flex-col gap-2 font-semibold">
              {craftDetail.craftMaterials
                .sort((a, b) => a.id - b.id)
                .map((material) => (
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4" key={material.id}>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <img src={material.iconLink} alt={material.marketName} className={"w-10 h-10 " + `${grade[material.grade]}`} />
                        <span className="absolute bottom-0 right-0 text-xs font-semibold text-white">{material.quantity}</span>
                      </div>
                      <span className={textColors[material.grade]}>{material.marketName}</span>
                    </div>
                    {/* <input defaultValue={material.currentMinPrice} className="bg-light dark:bg-bgdark dark:border-bddark border-bddark rounded-md p-2" type="text" /> */}
                    <div className="flex justify-end items-center">{material.bundleCount} 개</div>
                    <div className="flex justify-end items-center gap-1">
                      <div className="flex justify-center items-center">{convert === "default" ? material.currentMinPrice : material.convertPrice}</div>
                      <img className="w-5 h-5" src={goldIcon} alt="gold" />
                    </div>
                    <div className="flex justify-end items-center gap-1">
                      <div className="flex justify-center items-center">{Math.ceil(((convert === "default" ? material.currentMinPrice : material.convertPrice) / material.bundleCount) * 100) / 100}</div>
                      <img className="w-5 h-5" src={goldIcon} alt="gold" />
                    </div>
                    <div className="flex justify-end items-center gap-1">
                      <div className="flex justify-center items-center">{Math.ceil(((material.quantity * (convert === "default" ? material.currentMinPrice : material.convertPrice)) / material.bundleCount) * 100) / 100}</div>
                      <img className="w-5 h-5" src={goldIcon} alt="gold" />
                    </div>
                  </div>
                ))}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4">
                <div className="flex items-center">
                  <div className="relative">
                    <img src={itemIcon.골드} alt={"골드"} className={"w-10 h-10 " + `${grade["일반"]}`} />
                    <span className="absolute bottom-0 right-0 text-xs font-semibold text-white">{craftDetail.craftPrice}</span>
                  </div>
                  <span className="ml-2">골드</span>
                </div>
                <div className="flex justify-end items-center">1 개</div>
                <div className="flex justify-end items-center gap-1">
                  <div className="flex justify-center items-center">{craftDetail.craftPrice}</div>
                  <img className="w-5 h-5" src={goldIcon} alt="gold" />
                </div>
                <div className="flex justify-end items-center gap-1">
                  <div className="flex justify-center items-center">1</div>
                  <img className="w-5 h-5" src={goldIcon} alt="gold" />
                </div>
                <div className="flex justify-end items-center gap-1">
                  <div className="flex justify-center items-center">{Math.floor(craftDetail.craftPrice * (1 - 0.01 * (craftEffect["제작수수료 감소"][0] + craftEffect["제작수수료 감소"][craftDetail.category])))}</div>
                  <img className="w-5 h-5" src={goldIcon} alt="gold" />
                </div>
              </div>
            </div>
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
                            className="w-28 h-10 content-box border-solid border rounded-md border-bddark p-4"
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
    )
  );
}

export default CraftDetail;
