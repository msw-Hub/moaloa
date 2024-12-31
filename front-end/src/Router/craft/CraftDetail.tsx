import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import itemIcon from "../../data/itemIcon.json";
import { Modal } from "../../components/modal";
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
  originalMinPrice: number; // 기존 최저가 백업
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

function CraftDetail() {
  const { id } = useParams();
  const alertBox = useAlert();
  const [craftModalOpen, setCraftModalOpen] = useState(false);
  const goldIcon = "/itemIcon/gold.webp";

  const [craftDetail, setCraftDetail] = useState<CraftItem>();
  const [materialList, setMaterialList] = useState<Material>();
  const [craftEffect, setCraftEffect] = useState<CraftEffect>(getInitialCraftEffect);
  const [time, setTime] = useState<number>(0);
  const [priceStandard, setPriceStandard] = useState<string>(() => JSON.parse(localStorage.getItem("priceStandard") || `"currentMinPrice"`));
  const [convert, setConvert] = useState<string>(() => JSON.parse(localStorage.getItem("convert") || `"convert"`));

  useEffect(() => {
    localStorage.setItem("priceStandard", JSON.stringify(priceStandard));
  }, [priceStandard]);

  useEffect(() => {
    localStorage.setItem("convert", JSON.stringify(convert));
  }, [convert]);

  const materialIndex: {
    [key: string]: number;
  } = {
    들꽃: 0,
    "수줍은 들꽃": 1,
    "화사한 들꽃": 2,
    "아비도스 들꽃": 3,
    철광석: 0,
    "묵직한 철광석": 1,
    "단단한 철광석": 2,
    "아비도스 철광석": 3,
    생선: 0,
    "붉은 살 생선": 1,
    "오레하 태양 잉어": 2,
    "아비도스 태양 잉어": 3,
    "두툼한 생고기": 0,
    "다듬은 생고기": 1,
    "오레하 두툼한 생고기": 2,
    "아비도스 두툼한 생고기": 3,
    "진귀한 가죽": 4,
    "고대 유물": 0,
    "희귀한 유물": 1,
    "오레하 유물": 2,
    "아비도스 유물": 3,
    "진귀한 유물": 4,
    목재: 0,
    "부드러운 목재": 1,
    "튼튼한 목재": 2,
    "아비도스 목재": 3,
    "신속 로브": 0,
    "진군의 깃발": 1,
    "만능 물약": 0,
    "성스러운 부적": 1,
    신호탄: 2,
    "점토 수류탄": 0,
    "화염 수류탄": 1,
    "암흑 수류탄": 2,
    "회오리 수류탄": 3,
    "파괴 폭탄": 4,
    "부식 폭탄": 5,
    "수면 폭탄": 6,
    "성스러운 폭탄": 7,
    "정령의 회복약": 0,
  };

  const getCraftDetail = async (id: number) => {
    return axios
      .get(`${import.meta.env.VITE_APP_API_URL}/api/v1/craft/readData?craftItemId=${id}`)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        alertBox("목록을 불러오는데 실패했습니다.");
        console.error(err);
      });
  };

  const api = () => {
    Promise.all([getCraftDetail(Number(id))]).then((res) => {
      setTime(res[0].갱신시간);
      setCraftDetail(res[0].제작아이템);
      setMaterialList(materialConversion(res[0].제작재료시세));
    });
  };

  useEffect(() => {
    api();
  }, [id]);

  useEffect(() => {
    if (!craftDetail) return;
    calculateCraftValues(craftDetail);
  }, [materialList, craftEffect]);

  useEffect(() => {
    localStorage.setItem("craftEffect", JSON.stringify(craftEffect));
  }, [craftEffect]);

  //onMaterialPriceChange
  const onMaterialPriceChange = (e: React.ChangeEvent<HTMLInputElement>, marketID: number, subCode: number) => {
    if (!materialList) return;

    const updatedMaterialList = { ...materialList };
    for (const materialKey in updatedMaterialList) {
      updatedMaterialList[materialKey] = updatedMaterialList[materialKey].map((item) => {
        const { convert, ...rest } = item;
        return { ...rest };
      });
    }

    const updatedMaterial = updatedMaterialList[subCode];
    const updatedMaterialIndex = updatedMaterial.findIndex((item) => item.marketId === marketID);

    //모든 재료 convert 삭제

    //재료 가격 수정
    updatedMaterial[updatedMaterialIndex] = {
      ...updatedMaterial[updatedMaterialIndex],
      currentMinPrice: Number(e.target.value),
    };

    setMaterialList(materialConversion(updatedMaterialList));
  };

  // 생활 재료 변환 가격 추가
  const materialConversion = (materials: Material): Material => {
    const updatedMaterials = { ...materials };

    for (const materialKey in updatedMaterials) {
      // 기존 데이터의 convertPrice와 convertMaterial 필드를 제거
      // 카테고리 앞자리가 9가 아니면 밑에 코드 실행 안함
      if (materialKey[0] !== "9") continue;
      const material = updatedMaterials[materialKey];

      // 아비도스 교환 비율 계산 후 저장
      let grade1 = (material[0].currentMinPrice / 8) * 100; // 일반 100개 -> 가루 80개
      let grade2 = (material[1].currentMinPrice / 8) * 50; // 고급 50개 -> 가루 80개

      // 생활 재료 교환 탭
      if (materialKey === "90400" || materialKey === "90300") {
        const gradeConvert1 = material[0].currentMinPrice * 10;
        const gradeConvert2 = material[1].currentMinPrice * 5;

        //test1, gradeConvert2, material[2].currentMinPrice중 가장 작은 값이 grade1에 저장
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

      // 고고학, 낚시, 수렵의 경우 오레하 교환 비율 계산 후 저장
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

      // 재료 가격 찾기
      const findMaterial = materialList[material.subCode].find((item) => item.marketId === material.marketId);
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
    const craftCostMargin = Math.round((craftSellPrice / (craftItem.currentMinPrice * craftItem.craftQuantity - craftSellPrice)) * 10000) / 100;

    //전날 시세 판매 차익 및 원가이익률 계산
    const ydayCraftSellPrice = Math.ceil((craftItem.craftQuantity * (ydaySellPrice / craftItem.bundleCount) - craftPriceAll) * 100) / 100;
    const ydayCraftCostMargin = Math.round((ydayCraftSellPrice / (Math.ceil(craftItem.ydayAvgPrice) * craftItem.craftQuantity - ydayCraftSellPrice)) * 10000) / 100;

    //변환 시세 판매 차익 및 원가이익률 계산
    const convertCraftSellPrice = Math.ceil((craftItem.craftQuantity * (defaultSellPrice / craftItem.bundleCount) - convertCraftPriceAll) * 100) / 100;
    const convertCraftCostMargin = Math.round((convertCraftSellPrice / (craftItem.currentMinPrice * craftItem.craftQuantity - convertCraftSellPrice)) * 10000) / 100;
    //기본 재료

    const ydayConvertCraftSellPrice = Math.ceil((craftItem.craftQuantity * (ydaySellPrice / craftItem.bundleCount) - convertCraftPriceAll) * 100) / 100;
    const ydayConvertCraftCostMargin = Math.round((ydayConvertCraftSellPrice / (Math.ceil(craftItem.ydayAvgPrice) * craftItem.craftQuantity - ydayConvertCraftSellPrice)) * 10000) / 100;

    setCraftDetail({
      ...craftItem,
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
    });
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

  const craftTimeInSeconds = (craftTime: number) => {
    if (!craftDetail) return;
    const totalSeconds = Math.floor(craftTime * (1 - 0.01 * (craftEffect["제작시간 감소"][0] + craftEffect["제작시간 감소"][craftDetail.category])));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0 && seconds > 0) {
      return `${minutes}분 ${seconds}초`;
    } else if (minutes > 0) {
      return `${minutes}분`;
    } else {
      return `${seconds}초`;
    }
  };

  return (
    craftDetail && (
      <div className="sm:text-sm text-xs p-2 flex flex-col gap-6 md:min-w-[750px]">
        <CraftMetas></CraftMetas>
        <div className="flex flex-col justify-center items-center gap-4">
          <img className={grade[craftDetail?.grade] + " w-20 h-20"} src={craftDetail?.iconLink} alt="" />
          <h1 className={"text-2xl font-bold " + `${textColors[craftDetail?.grade]}`}>{craftDetail?.craftName}</h1>
          <p className=" text-gray-500">갱신시간: {time}</p>
        </div>
        {/*판매 기준 설정, 재료정보 변환, 영지 효과 */}
        <div className="content-box py-3 grid md:grid-cols-2 grid-cols-1 gap-2 px-4">
          <div className="flex justify-center items-center">
            <span className="sm:text-base text-sm mr-6 font-bold">판매시세</span>
            <button onClick={() => setPriceStandard("currentMinPrice")} className={`w-28 py-2 px-4 rounded-l-md ${priceStandard === "currentMinPrice" ? "active-btn" : "default-btn "}`}>
              현재 최저가
            </button>
            <button onClick={() => setPriceStandard("ydayAvgPrice")} className={`w-28 py-2 px-4 rounded-r-md ${priceStandard === "ydayAvgPrice" ? "active-btn" : "default-btn"}`}>
              전날 평균가
            </button>
          </div>
          <div className="flex justify-center items-center">
            <span className="sm:text-base text-sm mr-6 font-bold">생활재료</span>
            <button onClick={() => setConvert("convert")} className={`w-28 py-2 px-4 rounded-l-md ${convert === "convert" ? "active-btn" : "default-btn "}`}>
              변환 시세
            </button>
            <button onClick={() => setConvert("default")} className={`w-28 py-2 px-4 rounded-r-md ${convert === "default" ? "active-btn" : "default-btn "}`}>
              기본 시세
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] grid-cols-2 gap-6">
          {/* 제작 정보 */}
          <div className="sm:col-span-1 col-span-2 p-4 content-box">
            <h2 className="sm:text-base text-sm font-bold  mb-4 h-9">제작 정보</h2>
            <div className="space-y-2 font-medium">
              <div className="flex justify-between items-center">
                <div>제작단위</div>
                <div>{craftDetail?.craftQuantity}</div>
              </div>
              <div className="flex justify-between items-center">
                <div>활동력</div>
                <div>{Math.floor(craftDetail?.activityPrice * (1 - 0.01 * (craftEffect["활동력 감소"][0] + craftEffect["활동력 감소"][craftDetail?.category])))}</div>
              </div>
              <div className="flex justify-between items-center">
                <div>제작시간</div>
                <div>{craftTimeInSeconds(craftDetail?.craftTime)}</div>
              </div>
              <div className="flex justify-between items-center">
                <div>경험치</div>
                <div>{craftDetail.exp} EXP</div>
              </div>
              <div className="flex justify-between items-center">
                <div>제작비용</div>
                <div className="flex justify-center items-center gap-1">
                  <div>{convert === "default" ? craftDetail?.craft?.craftPriceAll : craftDetail?.convert?.convertCraftPriceAll}</div>
                  <img className="sm:w-5 sm:h-5 w-4 h-4" src={goldIcon} alt="gold" />
                </div>
              </div>
            </div>
          </div>

          {/* 판매 정보 */}
          <div className="sm:col-span-1 col-span-2 p-4 content-box">
            <div className="flex justify-between items-center mb-4">
              <h2 className="sm:text-base text-sm font-bold  text-balance h-9">판매 정보</h2>
              <button onClick={() => setCraftModalOpen(true)} className="flex transition-all bg-blue-400 dark:bg-bgdark font-bold text-white dark:text-gray-200 hover:bg-blue-500 dark:hover:bg-hoverdark shadow-md text-nowrap py-2 px-3  items-center justify-center rounded-md ">
                영지효과
              </button>
            </div>
            <div className="space-y-2 font-medium">
              <div className="flex justify-between items-center">
                <div>판매단위</div>
                <div>{craftDetail?.bundleCount}</div>
              </div>

              <div className="flex justify-between items-center">
                <div>시세</div>
                <div className="flex justify-center items-center gap-1">
                  <div>{priceStandard === "currentMinPrice" ? craftDetail?.currentMinPrice : Math.ceil(craftDetail?.ydayAvgPrice)}</div>
                  <img className="sm:w-5 sm:h-5 w-4 h-4" src={goldIcon} alt="gold" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>총 판매금액</div>
                <div className="flex items-center gap-1">
                  {
                    // 기본 시세 판매 차익
                    priceStandard === "currentMinPrice" ? (
                      <div>{isNaN(craftDetail?.craft?.craftPriceAll + craftDetail?.craft?.craftSellPrice) ? "0" : (craftDetail?.craft?.craftPriceAll + craftDetail?.craft?.craftSellPrice).toLocaleString()}</div>
                    ) : (
                      <div>{isNaN(craftDetail?.ydayCraft?.ydayCraftPriceAll + craftDetail?.ydayCraft?.ydayCraftSellPrice) ? "0" : (craftDetail?.ydayCraft?.ydayCraftPriceAll + craftDetail?.ydayCraft?.ydayCraftSellPrice).toLocaleString()}</div>
                    )
                  }
                  <img className="sm:w-5 sm:h-5 w-4 h-4" src={goldIcon} alt="gold" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>판매 차익</div>
                <div className="flex items-center gap-1">
                  {convert === "default" ? (
                    <div>{priceStandard === "currentMinPrice" ? craftDetail?.craft?.craftSellPrice : craftDetail?.ydayCraft?.ydayCraftSellPrice}</div>
                  ) : (
                    <div>{priceStandard === "currentMinPrice" ? craftDetail?.convert?.convertCraftSellPrice : craftDetail?.ydayConvert?.ydayConvertCraftSellPrice}</div>
                  )}
                  <img className="sm:w-5 sm:h-5 w-4 h-4" src={goldIcon} alt="gold" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>원가 이익률</div>

                {convert === "default" ? (
                  <div className={`${priceStandard === "currentMinPrice" ? (craftDetail?.craft?.craftCostMargin >= 0 ? "text-red-400" : "text-blue-400") : craftDetail?.ydayCraft?.ydayCraftCostMargin >= 0 ? "text-red-400" : "text-blue-400"}`}>
                    {priceStandard === "currentMinPrice" ? craftDetail?.craft?.craftCostMargin : craftDetail?.ydayCraft?.ydayCraftCostMargin}%
                  </div>
                ) : (
                  <div
                    className={`${
                      priceStandard === "currentMinPrice"
                        ? craftDetail?.convert?.convertCraftCostMargin !== undefined && craftDetail?.convert?.convertCraftCostMargin >= 0
                          ? "text-red-400"
                          : "text-blue-400"
                        : craftDetail?.ydayConvert?.ydayConvertCraftCostMargin !== undefined && craftDetail?.ydayConvert?.ydayConvertCraftCostMargin >= 0
                        ? "text-red-400"
                        : "text-blue-400"
                    }`}>
                    {priceStandard === "currentMinPrice" ? craftDetail?.convert?.convertCraftCostMargin : craftDetail?.ydayConvert?.ydayConvertCraftCostMargin}%
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 생활재료 교환 정보 */}
          {/*채광 벌목만 일반등급중 currentMinPrice가 있으면 변환 */}
          <div className="min-h-32 relative p-4 content-box font-medium md:col-span-1 col-span-2">
            <h2 className="sm:text-base text-sm font-bold  mb-4">생활재료 교환 정보</h2>
            <div className="grid grid-cols-[auto_0.3fr_auto] gap-5 font-semibold">
              {craftDetail.craftMaterials
                .sort((a, b) => a.id - b.id)
                .map((material, index) => {
                  if (!materialList) return null;
                  const materialData: MaterialItem | undefined = Object.values(materialList)
                    .flat()
                    .find((a) => a.marketId === material.marketId);
                  if (!materialData) return null;

                  // 목재, 철광석만 변환 가능
                  if (materialData?.marketName === "목재" || materialData?.marketName === "철광석") {
                    if (materialData?.convert?.convertMaterial) {
                      return (
                        <React.Fragment key={index}>
                          <div className="flex items-center justify-start gap-2">
                            <div className="relative">
                              <img className={`w-10 h-10 ${grade[materialData?.convert?.convertMaterial.grade]}`} src={itemIcon[materialData?.convert?.convertMaterial.marketName as keyof typeof itemIcon]} alt="재료아이템" />
                              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{materialData?.convert?.convertMaterial.grade === "고급" ? 25 : 5}</span>
                            </div>
                            <span className={textColors[materialData?.convert?.convertMaterial?.grade]}>{materialData?.convert?.convertMaterial?.marketName}</span>
                          </div>
                          <i className="flex justify-center items-center xi-arrow-right"></i>
                          <div className="flex items-center justify-start gap-2">
                            <div className="relative">
                              <img className={`w-10 h-10 ${grade[materialData?.grade]}`} src={itemIcon[materialData?.marketName as keyof typeof itemIcon]} alt="재료아이템" />
                              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">50</span>
                            </div>
                            <span className={textColors[materialData?.grade]}>{materialData?.marketName}</span>
                          </div>
                        </React.Fragment>
                      );
                    }
                  }

                  // 모든 재료 변환 가능 (아비도스, 오레하)
                  if (material?.grade === "희귀" && material?.marketName !== "진귀한 유물" && material?.marketName !== "진귀한 가죽") {
                    const lastString = material.marketName.split(" ")[material.marketName.split(" ").length - 1];
                    if (materialData?.convert?.convertMaterial) {
                      return (
                        <React.Fragment key={index}>
                          <div className="flex items-center justify-start gap-2">
                            <div className="relative">
                              <img className={`w-10 h-10 ${grade[materialData?.convert?.convertMaterial?.grade]}`} src={itemIcon[materialData?.convert?.convertMaterial?.marketName as keyof typeof itemIcon]} alt="재료아이템" />
                              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{materialData?.convert?.convertMaterial?.grade === "고급" ? 50 : 100}</span>
                            </div>
                            <span className={textColors[materialData?.convert?.convertMaterial?.grade]}>{materialData?.convert?.convertMaterial?.marketName}</span>
                          </div>
                          <i className="flex justify-center items-center xi-arrow-right"></i>
                          <div className="flex justify-start items-center gap-2">
                            <div className="relative">
                              <img
                                className={`w-10 h-10 ${grade.일반}`}
                                src={itemIcon[lastString === "들꽃" ? "채집의 가루" : lastString === "철광석" ? "채광의 가루" : lastString === "목재" ? "벌목의 가루" : lastString === "생고기" ? "수렵의 가루" : lastString === "유물" ? "고고학의 가루" : "낚시의 가루"]}
                                alt="가루"
                              />
                              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">80</span>
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
                              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">100</span>
                            </div>
                            <span>{lastString === "들꽃" ? "채집의 가루" : lastString === "철광석" ? "채광의 가루" : lastString === "목재" ? "벌목의 가루" : lastString === "생고기" ? "수렵의 가루" : lastString === "유물" ? "고고학의 가루" : "낚시의 가루"}</span>
                          </div>
                          <i className="flex justify-center items-center xi-arrow-right"></i>
                          <div className="flex justify-start items-center gap-2">
                            <div className="relative">
                              <img className={`w-10 h-10 ${grade[materialData?.grade]}`} src={itemIcon[materialData?.marketName as keyof typeof itemIcon]} alt="재료아이템" />
                              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">10</span>
                            </div>
                            <span className={textColors[materialData?.grade]}>{materialData?.marketName}</span>
                          </div>
                        </React.Fragment>
                      );
                    }
                  }
                })}
            </div>
            {/*교환가능한 재료가 없을때 */}
            {craftDetail.craftMaterials
              .sort((a, b) => a.id - b.id)
              .map((material) => {
                if (!materialList) return null;
                const materialData: MaterialItem | undefined = Object.values(materialList)
                  .flat()
                  .find((a) => a.marketId === material.marketId);
                if (!materialData) return null;
                if (materialData?.convert?.convertMaterial) return 1;
              })
              .filter((a) => a).length === 0 && <div className="absolute top-1/2 left-1/2 -translate-x-1/2  font-semibold">교환 가능한 재료가 없습니다.</div>}
          </div>
          <div className="flex flex-col gap-6 md:col-span-1 col-span-2">
            {/* 재료 가격 수정 */}
            <div className="p-4 content-box md:col-span-1 col-span-2">
              <h2 className="sm:text-base text-sm font-bold  mb-4">재료 가격 수정</h2>
              <div className="flex flex-col font-semibold">
                {craftDetail?.craftMaterials
                  .sort((a, b) => a.id - b.id)
                  .map((material) => (
                    <React.Fragment key={material.id}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex justify-center items-center gap-2">
                          <div className="relative">
                            <img src={material.iconLink} alt={material.marketName} className={"w-10 h-10 " + `${grade[material.grade]}`} />
                            <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{material.bundleCount}</span>
                          </div>
                          <span className={textColors[material.grade]}>{material.marketName}</span>
                        </div>
                        {materialList && (
                          <input
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => onMaterialPriceChange(e, material.marketId, material.subCode)}
                            defaultValue={materialList[material.subCode][materialIndex[material.marketName]].currentMinPrice}
                            className="bg-light dark:bg-bgdark w-24 text-right p-2 rounded-sm border border-bddark dark:border-bddark "
                            type="text"
                          />
                        )}
                      </div>
                    </React.Fragment>
                  ))}
              </div>
            </div>
            {/*교환 재료 가격 수정 */}
            <div className="p-4 content-box font-semibold">
              <h2 className="sm:text-base text-sm font-bold  mb-4">교환 재료 가격 수정</h2>
              {craftDetail.craftMaterials
                .sort((a, b) => a.id - b.id)
                .map((material) => (
                  <React.Fragment key={material.id}>
                    {
                      // marketName이 목재이면 부드러운목재 추가 단 이미 부드러운목재가 있으면 추가하지 않음
                      material.marketName === "목재" && materialList && !craftDetail.craftMaterials.find((a) => a.marketName === "부드러운 목재") && (
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex justify-center items-center gap-2">
                            <div className="relative">
                              <img src={itemIcon["부드러운 목재"]} alt={"부드러운 목재"} className={"w-10 h-10 " + `${grade["고급"]}`} />
                              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{material.bundleCount}</span>
                            </div>
                            <span className={textColors["고급"]}>부드러운 목재</span>
                          </div>
                          <input
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => onMaterialPriceChange(e, materialList[90300][1].marketId, 90300)}
                            defaultValue={materialList[90300][1].currentMinPrice}
                            className="bg-light dark:bg-bgdark w-24 text-right p-2 rounded-sm border border-bddark dark:border-bddark"
                            type="text"
                          />
                        </div>
                      )
                    }
                    {
                      // marketName이 목재 이면 튼튼한목재 추가 단 이미 튼튼한목재가 있으면 추가하지 않음
                      material.marketName === "목재" && materialList && !craftDetail.craftMaterials.find((a) => a.marketName === "튼튼한 목재") && (
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex justify-center items-center gap-2">
                            <div className="relative">
                              <img src={itemIcon["튼튼한 목재"]} alt={"튼튼한 목재"} className={"w-10 h-10 " + `${grade["희귀"]}`} />
                              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{material.bundleCount}</span>
                            </div>
                            <span className={textColors["희귀"]}>튼튼한 목재</span>
                          </div>
                          <input
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => onMaterialPriceChange(e, materialList[90300][2].marketId, 90300)}
                            defaultValue={materialList[90300][2].currentMinPrice}
                            className="bg-light dark:bg-bgdark w-24 text-right p-2 rounded-sm border border-bddark dark:border-bddark"
                            type="text"
                          />
                        </div>
                      )
                    }
                    {
                      // marketName이 철광석이면 묵직한 철광석 추가 단 이미 묵직한 철광석이 있으면 추가하지 않음
                      material.marketName === "철광석" && materialList && !craftDetail.craftMaterials.find((a) => a.marketName === "묵직한 철광석") && (
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex justify-center items-center gap-2">
                            <div className="relative">
                              <img src={itemIcon["묵직한 철광석"]} alt={"묵직한 철광석"} className={"w-10 h-10 " + `${grade["고급"]}`} />
                              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{material.bundleCount}</span>
                            </div>
                            <span className={textColors["고급"]}>묵직한 철광석</span>
                          </div>
                          <input
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => onMaterialPriceChange(e, materialList[90400][1].marketId, 90400)}
                            defaultValue={materialList[90400][1].currentMinPrice}
                            className="bg-light dark:bg-bgdark w-24 text-right p-2 rounded-sm border border-bddark dark:border-bddark"
                            type="text"
                          />
                        </div>
                      )
                    }
                    {
                      // marketName이 철광석이면 단단한 철광석 추가 단 이미 단단한 철광석이 있으면 추가하지 않음
                      material.marketName === "철광석" && materialList && !craftDetail.craftMaterials.find((a) => a.marketName === "단단한 철광석") && (
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex justify-center items-center gap-2">
                            <div className="relative">
                              <img src={itemIcon["단단한 철광석"]} alt={"단단한 철광석"} className={"w-10 h-10 " + `${grade["희귀"]}`} />
                              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{material.bundleCount}</span>
                            </div>
                            <span className={textColors["희귀"]}>단단한 철광석</span>
                          </div>
                          <input
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => onMaterialPriceChange(e, materialList[90400][2].marketId, 90400)}
                            defaultValue={materialList[90400][2].currentMinPrice}
                            className="bg-light dark:bg-bgdark w-24 text-right p-2 rounded-sm border border-bddark dark:border-bddark"
                            type="text"
                          />
                        </div>
                      )
                    }
                  </React.Fragment>
                ))}
              {/*교환가능한 재료가 없을때 */}
              {craftDetail.craftMaterials
                .map((material) => {
                  if (material.marketName === "목재" && materialList && !craftDetail.craftMaterials.find((a) => a.marketName === "부드러운 목재")) return 1;
                  if (material.marketName === "목재" && materialList && !craftDetail.craftMaterials.find((a) => a.marketName === "튼튼한 목재")) return 1;
                  if (material.marketName === "철광석" && materialList && !craftDetail.craftMaterials.find((a) => a.marketName === "묵직한 철광석")) return 1;
                  if (material.marketName === "철광석" && materialList && !craftDetail.craftMaterials.find((a) => a.marketName === "단단한 철광석")) return 1;
                })
                .filter((a) => a).length === 0 && <div className="flex justify-center items-center font-semibold">교환 가능한 재료가 없습니다.</div>}
            </div>
          </div>
        </div>

        {/* 재료 정보 */}
        <div className="p-4 content-box">
          <div className="flex justify-between items-center mb-4">
            <h2 className="sm:text-base text-sm font-bold ">재료 정보</h2>
            {/*수수료 감소 수치; */}
            <span className=" text-zinc-400">수수료 감소율 : {craftEffect["제작수수료 감소"][0] + craftEffect["제작수수료 감소"][craftDetail.category]}%</span>
          </div>
          <div>
            <div className="grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] grid-cols-[1fr_1fr_1fr_1.5fr] gap-4 text-center font-bold mb-2">
              <div className="flex justify-start items-center">재료</div>
              <div className="sm:flex hidden justify-end items-center">단위</div>
              <div className="flex justify-end items-center">시세</div>
              <div className="flex justify-end items-center">개당 가격</div>
              <div className="flex justify-end items-center">총 비용</div>
            </div>
            <div className="flex flex-col  font-semibold">
              {craftDetail.craftMaterials
                .sort((a, b) => a.id - b.id)
                .map((material) => {
                  if (!materialList) return null;
                  return (
                    <div className="grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] grid-cols-[1fr_1fr_1fr_1.5fr] gap-4 border-t border-solid border-bddark py-1 px-2" key={material.id}>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <img src={material.iconLink} alt={material.marketName} className={"w-10 h-10 " + `${grade[material.grade]}`} />
                          <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{material.quantity}</span>
                        </div>
                        <span className={textColors[material.grade] + " sm:block hidden"}>{material.marketName}</span>
                      </div>
                      {/* <input defaultValue={material.currentMinPrice} className="bg-light dark:bg-bgdark dark:border-bddark border-bddark rounded-md p-2" type="text" /> */}
                      <div className="sm:flex hidden justify-end items-center">{material.bundleCount} 개</div>
                      <div className="flex justify-end items-center gap-1">
                        <div className="flex justify-center items-center">
                          {convert === "default"
                            ? materialList[material.subCode][materialIndex[material.marketName]].currentMinPrice
                            : materialList[material.subCode][materialIndex[material.marketName]].convert?.convertPrice ?? materialList[material.subCode][materialIndex[material.marketName]].currentMinPrice}
                        </div>
                        <img className="sm:w-5 sm:h-5 w-4 h-4" src={goldIcon} alt="gold" />
                      </div>
                      <div className="flex justify-end items-center gap-1">
                        <div className="flex justify-center items-center">
                          {Math.ceil(
                            ((convert === "default"
                              ? materialList[material.subCode][materialIndex[material.marketName]].currentMinPrice
                              : materialList[material.subCode][materialIndex[material.marketName]].convert?.convertPrice ?? materialList[material.subCode][materialIndex[material.marketName]].currentMinPrice) /
                              material?.bundleCount) *
                              100
                          ) / 100}
                        </div>
                        <img className="sm:w-5 sm:h-5 w-4 h-4" src={goldIcon} alt="gold" />
                      </div>
                      <div className="flex justify-end items-center gap-1">
                        <div className="flex justify-center items-center">
                          {Math.ceil(
                            ((material.quantity *
                              (convert === "default"
                                ? materialList[material.subCode][materialIndex[material.marketName]].currentMinPrice
                                : materialList[material.subCode][materialIndex[material.marketName]].convert?.convertPrice ?? materialList[material.subCode][materialIndex[material.marketName]].currentMinPrice)) /
                              material?.bundleCount) *
                              100
                          ) / 100}
                        </div>
                        <img className="sm:w-5 sm:h-5 w-4 h-4" src={goldIcon} alt="gold" />
                      </div>
                    </div>
                  );
                })}
              <div className="grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] grid-cols-[1fr_1fr_1fr_1.5fr] gap-4 border-t border-solid border-bddark py-1 px-2">
                <div className="flex items-center">
                  <div className="relative">
                    <img src={itemIcon.골드} alt={"골드"} className={"w-10 h-10 " + `${grade["일반"]}`} />
                    <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{craftDetail.craftPrice}</span>
                  </div>
                  <span className="ml-2 sm:block hidden">골드</span>
                </div>
                <div className="sm:flex hidden justify-end items-center">1 개</div>
                <div className="flex justify-end items-center gap-1">
                  <div className="flex justify-center items-center">{craftDetail.craftPrice}</div>
                  <img className="sm:w-5 sm:h-5 w-4 h-4" src={goldIcon} alt="gold" />
                </div>
                <div className="flex justify-end items-center gap-1">
                  <div className="flex justify-center items-center">1</div>
                  <img className="sm:w-5 sm:h-5 w-4 h-4" src={goldIcon} alt="gold" />
                </div>
                <div className="flex justify-end items-center gap-1">
                  <div className="flex justify-center items-center">{Math.floor(craftDetail.craftPrice * (1 - 0.01 * (craftEffect["제작수수료 감소"][0] + craftEffect["제작수수료 감소"][craftDetail.category])))}</div>
                  <img className="sm:w-5 sm:h-5 w-4 h-4" src={goldIcon} alt="gold" />
                </div>
              </div>
            </div>
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
                            className="w-28 h-10  shadow-sm bg-gray-50 dark:bg-ctdark text-bgdark dark:text-light border-solid border rounded-md border-bddark p-4"
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
    )
  );
}
export default CraftDetail;
