import axios from "axios";
import { MaterialMetas } from "../../metadatas/metadatas";
import React, { useEffect, useState } from "react";
import { useAlert } from "../../hooks/useAlert";
import materialIcon from "../../data/itemIcon.json";

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
    proportion: number;
    sellPriceAll: number;
    convertPrice: number;
    convertMaterial: MaterialItem;
  };
}

interface Grade {
  [key: string]: string;
}

function Material() {
  const [materialList, setMaterialList] = useState<Material>();
  //90200,90300,90400,90500,90600,90700
  const categorys = [
    { subCode: 90200, categoryName: "채집" },
    { subCode: 90300, categoryName: "벌목" },
    { subCode: 90400, categoryName: "채광" },
    { subCode: 90500, categoryName: "수렵" },
    { subCode: 90600, categoryName: "낚시" },
    { subCode: 90700, categoryName: "고고학" },
  ];
  const [categoryState, setCategoryState] = useState<number>(90200);
  const [simplify, setSimplify] = useState<boolean>(true);
  const alertBox = useAlert();

  function getCraftList() {
    axios(`${import.meta.env.VITE_APP_API_URL}/api/v1/craft/readDataAll`)
      .then((res) => {
        console.log(res.data.제작재료시세);
        setMaterialList(materialConversion(res.data.제작재료시세));
      })
      .catch((err) => {
        alertBox("목록을 불러오는데 실패했습니다.");
        console.error(err);
      });
  }

  //재료 변환
  const materialConversion = (materials: Material): Material => {
    const updatedMaterials = { ...materials };

    for (const materialKey in updatedMaterials) {
      // 기존 데이터의 convertPrice와 convertMaterial 필드를 제거
      if (materialKey[0] !== "9") continue;
      const material = updatedMaterials[materialKey];
      //[0]은 일반 [1]은 고급
      //[3]은 90300(벌목) || 90400(채광) 만 일반으로 변환가능
      //나머지 [3]은 오레하임 일반이나 고급을 사용해서 변환가능
      //[4]은 아비도스로 일반이나 고급을 사용해서 변환가능
      //변환했을때 이득이면 convert에 변환가격과 변환재료를 넣어줌
      let convertSellPrice = 0;
      let high = 0;

      if (material[2].currentMinPrice >= material[3].currentMinPrice) {
        convertSellPrice = Math.ceil(material[2].currentMinPrice * 0.05);
        high = 2;
      } else {
        convertSellPrice = Math.ceil(material[3].currentMinPrice * 0.05);
        high = 3;
      }
      material.forEach((item, index) => {
        //판매 수량 가정

        //판매수수료 포함 금액 1개 판매했을때 비용
        const sellPrice = item.currentMinPrice - Math.ceil(item.currentMinPrice * 0.05);

        //변환 재료가 일반일때
        if (index === 0) {
          const quantity = 5000;
          //가루 변환후 오레하 제작 개수
          const convertItemCount = (quantity * 8) / 100;
          //변환된 오레하 판매 수수료
          const convertPee = (convertItemCount / 100) * convertSellPrice;
          //총 수수료 제외 비용
          const convertTotalPrice = (convertItemCount / 100) * material[high].currentMinPrice - convertPee;

          if (convertTotalPrice > (sellPrice * quantity) / 100) {
            item.convert = {
              proportion: Math.round((convertTotalPrice / ((sellPrice * quantity) / 100)) * 1000) / 1000,
              sellPriceAll: (sellPrice * quantity) / 100,
              convertPrice: convertTotalPrice,
              convertMaterial: material[high],
            };
          }
        }
        //변환 재료가 고급일때 일반으로 바꾸는 게 이득인지 아비도스로 바꾸는게 이득인지
        else if (index == 1) {
          const quantity = 2500;

          //1. 고급 재료를 경매장에 그대로 판매 금액 계산
          const sellPrice1 = ((item.currentMinPrice - Math.ceil(item.currentMinPrice * 0.05)) * quantity) / 100;
          // 2. 고급 재료를 일반 재료로 교환후 판매 금액 계산 비율은 1:2
          const sellPrice2 = ((material[0].currentMinPrice - Math.ceil(material[0].currentMinPrice * 0.05)) * quantity) / 50;

          //가루 변환후 오레하 제작 개수
          const convertItemCount = (quantity * 16) / 100;
          //변환된 오레하 판매 수수료
          const convertPee = (convertItemCount / 100) * convertSellPrice;
          //총 수수료 제외 비용
          const sellPrice3 = (convertItemCount / 100) * material[high].currentMinPrice - convertPee;

          if (sellPrice1 < sellPrice2 && sellPrice2 > sellPrice3) {
            item.convert = {
              proportion: Math.round((sellPrice2 / sellPrice1) * 1000) / 1000,
              sellPriceAll: sellPrice1,
              convertPrice: sellPrice2,
              convertMaterial: material[0],
            };
          } else if (sellPrice1 < sellPrice3 && sellPrice2 < sellPrice3) {
            item.convert = {
              proportion: Math.round((sellPrice3 / sellPrice1) * 1000) / 1000,
              sellPriceAll: sellPrice1,
              convertPrice: sellPrice3,
              convertMaterial: material[3],
            };
          }
        }

        //튼튼한 목재, 단단한 철광석을 일반 재료로 교환 후 오레하 제작
        else if (index == 2 && (materialKey === "90300" || materialKey === "90400")) {
          const quantity = 5000;
          //순서
          //1. 튼튼한 목재, 단단한 철광석을 경매장에 그대로 판매 금액 계산
          //2. index 2인 튼튼한 목재, 단단한 철광석을 일반 재료로 교환후 판매 금액 계산
          //3. 일반 재료를 아비도스로 제작 후 판매 금액 계산
          //4. 1, 2, 3의 비용을 비교하여 이득이면 convert에 변환가격과 변환재료를 넣어줌
          //만약 convert가 없으면 튼튼한 목재, 단단한 철광석을 그대로 판매하는게 이득

          //1. 튼튼한 목재, 단단한 철광석을 경매장에 그대로 판매 금액 계산
          const sellPrice1 = ((item.currentMinPrice - Math.ceil(item.currentMinPrice * 0.05)) * quantity) / 1000;
          //2. index 2인 튼튼한 목재, 단단한 철광석을 일반 재료로 교환후 판매 금액 계산 이때 비율은 1:10
          const sellPrice2 = ((material[0].currentMinPrice - Math.ceil(material[0].currentMinPrice * 0.05)) * quantity) / 100;

          //3. 일반 재료를 아비도스로 제작 후 판매 금액 계산
          //가루 변환후 오레하 제작 개수
          const convertItemCount = (quantity * 8) / 100;
          //변환된 오레하 판매 수수료
          const convertPee = (convertItemCount / 100) * convertSellPrice;
          //총 수수료 제외 비용
          const sellPrice3 = (convertItemCount / 100) * material[high].currentMinPrice - convertPee;

          //1이 가장 크다면 convert에 넣지않음
          //2가 가장 크다면 convert에 넣음
          //3이 가장 크다면 convert에 넣음
          if (sellPrice1 < sellPrice2 && sellPrice2 > sellPrice3) {
            item.convert = {
              proportion: Math.round((sellPrice2 / sellPrice1) * 1000) / 1000,
              sellPriceAll: sellPrice1,
              convertPrice: sellPrice2,
              convertMaterial: material[0],
            };
          } else if (sellPrice1 < sellPrice3 && sellPrice2 < sellPrice3) {
            item.convert = {
              proportion: Math.round((sellPrice3 / sellPrice1) * 1000) / 1000,
              sellPriceAll: sellPrice1,
              convertPrice: sellPrice3,
              convertMaterial: material[3],
            };
          }
        }
      });
    }
    return updatedMaterials;
  };

  //재료 가격 수정
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

  useEffect(() => {
    console.log(materialList);
  }, [materialList]);

  // 컴포넌트가 마운트될 때 `getCraftList` 함수를 호출
  useEffect(() => {
    getCraftList();
  }, []);

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
    <>
      <MaterialMetas></MaterialMetas>
      {materialList && (
        <div className="sm:text-sm text-xs flex justify-center lg:items-start items-center lg:flex-row flex-col gap-4 p-2">
          <div className="flex flex-col justify-start items-center gap-4 max-w-[22rem]">
            <div className="content-box p-4 flex justify-center items-center col-span-1 w-full">
              {categorys.map((category) => {
                return (
                  <button className={"py-1 px-2 " + `${category.subCode === categoryState ? "active-btn" : "default-btn"}`} onClick={() => setCategoryState(Number(category.subCode))} key={category.subCode}>
                    {category.categoryName}
                  </button>
                );
              })}
            </div>
            <div className="p-4 content-box col-span-1 col-start-1 w-full">
              <h2 className="sm:text-base text-sm font-bold  mb-4">재료 가격 수정</h2>
              <div className="flex flex-col font-semibold">
                {materialList[categoryState].map((material) => (
                  <React.Fragment key={material.marketId}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex justify-center items-center gap-2">
                        <div className="relative">
                          <img src={materialIcon[material.marketName as keyof typeof materialIcon]} alt={material.marketName} className={"w-10 h-10 " + `${grade[material.grade]}`} />
                          {/* <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{material.bundleCount}</span> */}
                        </div>
                        <span className={textColors[material.grade]}>{material.marketName}</span>
                      </div>
                      {materialList && (
                        <input
                          onFocus={(e) => e.target.select()}
                          defaultValue={material.currentMinPrice}
                          onChange={(e) => onMaterialPriceChange(e, material.marketId, categoryState)}
                          className="bg-light dark:bg-bgdark w-24 text-right p-2 rounded-sm border border-bddark dark:border-bddark "
                          type="text"
                        />
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          {/*결과 출력 */}
          <div className=" content-box p-4 row-start-1 col-start-2 row-span-2">
            <div className="flex justify-between items-center  mb-4">
              <h2 className="sm:text-base text-sm font-bold">재료 변환 결과</h2>
              {/*간소화 토글 버튼 */}
              <label className="autoSaverSwitch relative inline-flex cursor-pointer select-none items-center">
                <input type="checkbox" name="autoSaver" className="sr-only" checked={simplify} onChange={() => setSimplify(!simplify)} />
                <span className="font-bold pr-2">간소화</span>
                <span className={`slider mr-3 flex h-[26px] w-[50px] items-center rounded-full p-1 duration-200 ${simplify ? "bg-blue-400 dark:bg-[#303030]" : "bg-[#CCCCCE] dark:bg-bddark"}`}>
                  <span className={`dot h-[18px] w-[18px] rounded-full bg-white duration-200 ${simplify ? "translate-x-6" : ""}`}></span>
                </span>
                <span className="label flex items-center text-sm font-medium text-black"></span>
              </label>
            </div>
            <div className="lg:w-[500px] grid grid-cols-[1fr_0.3fr_1fr] gap-y-1 font-semibold">
              {materialList[categoryState].map((material) => {
                return <MaterialCord key={material.marketId} material={material} simplify={simplify}></MaterialCord>;
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MaterialCord(props: { material: MaterialItem; simplify: boolean }) {
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

  //간소화 state 에따라 재료 목록을 전부 보여줄지 간소화된 목록을 보여줄지 결정
  const lastString = props.material.marketName.split(" ")[props.material.marketName.split(" ").length - 1];
  if (props.simplify) {
    return (
      <>
        {/*간소화 했을때 */}
        {/*처음 아이템과 convert만 보여줌 */}
        <div className="mt-3 col-span-3 flex justify-between items-center">
          <div className={"font-semibold " + `${textColors[props.material.grade]}`}>{props.material.marketName}</div>
          {/*이득률 */}
          <div className={"flex justify-start items-center font-semibold " + `${props.material.convert && props.material.convert.proportion > 0 ? "text-red-400" : "text-blue-400"}`}>
            이득률 : {props.material.convert && isFinite(props.material.convert.proportion) ? Math.round((props.material.convert.proportion - 1) * 10000) / 100 + "%" : "0%"}
          </div>
        </div>
        <div className="flex justify-start items-center gap-2 p-2 border-t border-solid border-bddark">
          <div className="relative">
            <img src={materialIcon[props.material.marketName as keyof typeof materialIcon]} alt={props.material.marketName} className={"w-10 h-10 " + `${grade[props.material.grade]}`} />
            <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{props.material.grade === "고급" ? 50 : props.material.grade === "희귀" ? 10 : 100}</span>
          </div>
          <span className={textColors[props.material.grade]}>{props.material.marketName}</span>
        </div>
        <i className="flex justify-center items-center xi-arrow-right p-2 border-t border-solid border-bddark"></i>
        {props.material.convert ? (
          <div className="flex justify-start items-center gap-2 p-2 border-t border-solid border-bddark">
            <div className="relative">
              <img src={materialIcon[props.material.convert.convertMaterial.marketName as keyof typeof materialIcon]} alt={props.material.convert.convertMaterial.marketName} className={"w-10 h-10 " + `${grade[props.material.convert.convertMaterial.grade]}`} />
              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{props.material.convert.convertMaterial.grade === "고급" ? 50 : props.material.convert.convertMaterial.grade === "희귀" ? 10 : 100}</span>
            </div>
            <span className={textColors[props.material.convert.convertMaterial.grade]}>{props.material.convert.convertMaterial.marketName}</span>
          </div>
        ) : (
          <div className="flex justify-start items-center gap-2 p-2 border-t border-solid border-bddark">
            <div className="relative">
              <img src={materialIcon[props.material.marketName as keyof typeof materialIcon]} alt={props.material.marketName} className={"w-10 h-10 " + `${grade[props.material.grade]}`} />
              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{props.material.grade === "고급" ? 50 : props.material.grade === "희귀" ? 10 : 100}</span>
            </div>
            <span className={textColors[props.material.grade]}>{props.material.marketName}</span>
          </div>
        )}
      </>
    );
  } else {
    if ((props.material.grade == "일반" || props.material.grade == "고급") && props.material.convert) {
      return (
        <>
          {/*일반, 고급 -> 가루 */}
          <div className="mt-3 col-span-3 flex justify-between items-center">
            <div className={"font-semibold " + `${textColors[props.material.grade]}`}>{props.material.marketName}</div>
            {/*이득률 */}
            <div className={"flex justify-start items-center font-semibold " + `${props.material.convert && props.material.convert.proportion > 0 ? "text-red-400" : "text-blue-400"}`}>
              이득률 : {props.material.convert && isFinite(props.material.convert.proportion) ? Math.round((props.material.convert.proportion - 1) * 10000) / 100 + "%" : "0%"}
            </div>
          </div>
          <div className="flex justify-start items-center gap-2 p-2 border-t border-solid border-bddark">
            <div className="relative">
              <img src={materialIcon[props.material.marketName as keyof typeof materialIcon]} alt={props.material.marketName} className={"w-10 h-10 " + `${grade[props.material.grade]}`} />
              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{props.material.grade === "고급" ? 50 : 100}</span>
            </div>
            <span className={textColors[props.material.grade]}>{props.material.marketName}</span>
          </div>
          <i className="flex justify-center items-center xi-arrow-right p-2 border-t border-solid border-bddark"></i>
          <div className="flex justify-start items-center gap-2 p-2 border-t border-solid border-bddark">
            <div className="relative">
              <img
                className={`w-10 h-10 ${grade.일반}`}
                src={materialIcon[lastString === "들꽃" ? "채집의 가루" : lastString === "철광석" ? "채광의 가루" : lastString === "목재" ? "벌목의 가루" : lastString === "생고기" ? "수렵의 가루" : lastString === "유물" ? "고고학의 가루" : "낚시의 가루"]}
                alt="가루"
              />
              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">80</span>
            </div>
            <span>{lastString === "들꽃" ? "채집의 가루" : lastString === "철광석" ? "채광의 가루" : lastString === "목재" ? "벌목의 가루" : lastString === "생고기" ? "수렵의 가루" : lastString === "유물" ? "고고학의 가루" : "낚시의 가루"}</span>
          </div>

          {/*가루 -> 오레하 , 아비도스 */}
          <div className="flex justify-start items-center gap-2 p-2">
            <div className="relative">
              <img
                className={`w-10 h-10 ${grade.일반}`}
                src={materialIcon[lastString === "들꽃" ? "채집의 가루" : lastString === "철광석" ? "채광의 가루" : lastString === "목재" ? "벌목의 가루" : lastString === "생고기" ? "수렵의 가루" : lastString === "유물" ? "고고학의 가루" : "낚시의 가루"]}
                alt="가루"
              />
              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">100</span>
            </div>
            <span>{lastString === "들꽃" ? "채집의 가루" : lastString === "철광석" ? "채광의 가루" : lastString === "목재" ? "벌목의 가루" : lastString === "생고기" ? "수렵의 가루" : lastString === "유물" ? "고고학의 가루" : "낚시의 가루"}</span>
          </div>
          <i className="flex justify-center items-center xi-arrow-right p-2"></i>
          <div className="flex justify-start items-center gap-2 p-2">
            <div className="relative">
              <img src={materialIcon[props.material.convert.convertMaterial.marketName as keyof typeof materialIcon]} alt={props.material.convert.convertMaterial.marketName} className={"w-10 h-10 " + `${grade[props.material.convert.convertMaterial.grade]}`} />
              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">10</span>
            </div>
            <span className={textColors[props.material.convert.convertMaterial.grade]}>{props.material.convert.convertMaterial.marketName}</span>
          </div>
        </>
      );
    }

    // 단단한 철광석, 튼튼한 목재
    if (props.material.marketName === "단단한 철광석" || props.material.marketName === "튼튼한 목재") {
      // 일반까지만 교환시
      if (props.material.convert && props.material.convert.convertMaterial.grade === "일반") {
        return (
          <>
            <div className="mt-3 col-span-3 flex justify-between items-center">
              <div className={"font-semibold " + `${textColors[props.material.grade]}`}>{props.material.marketName}</div>
              {/*이득률 */}
              <div className={"flex justify-start items-center font-semibold " + `${props.material.convert && props.material.convert.proportion > 0 ? "text-red-400" : "text-blue-400"}`}>
                이득률 : {props.material.convert && isFinite(props.material.convert.proportion) ? Math.round((props.material.convert.proportion - 1) * 10000) / 100 + "%" : "0%"}
              </div>
            </div>
            <div className="flex justify-start items-center gap-2 p-2 border-t border-solid border-bddark">
              <div className="relative">
                <img src={materialIcon[props.material.marketName as keyof typeof materialIcon]} alt={props.material.marketName} className={"w-10 h-10 " + `${grade[props.material.grade]}`} />
                <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">5</span>
              </div>
              <span className={textColors[props.material.grade]}>{props.material.marketName}</span>
            </div>
            <i className="flex justify-center items-center xi-arrow-right p-2 border-t border-solid border-bddark"></i>
            <div className="flex justify-start items-center gap-2 p-2 border-t border-solid border-bddark">
              <div className="relative">
                <img src={materialIcon[props.material.convert.convertMaterial.marketName as keyof typeof materialIcon]} alt={props.material.convert.convertMaterial.marketName} className={"w-10 h-10 " + `${grade[props.material.convert.convertMaterial.grade]}`} />
                <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">50</span>
              </div>
              <span className={textColors[props.material.convert.convertMaterial.grade]}>{props.material.convert.convertMaterial.marketName}</span>
            </div>
          </>
        );
      }
      // 가루로 오레하나 아비도스로 교환시
      if (props.material.convert && props.material.convert.convertMaterial.grade === "희귀") {
        return (
          <>
            <div className="mt-3 col-span-3 flex justify-between items-center">
              <div className={"font-semibold " + `${textColors[props.material.grade]}`}>{props.material.marketName}</div>
              {/*이득률 */}
              <div className={"flex justify-start items-center font-semibold " + `${props.material.convert && props.material.convert.proportion > 0 ? "text-red-400" : "text-blue-400"}`}>
                이득률 : {props.material.convert && isFinite(props.material.convert.proportion) ? Math.round((props.material.convert.proportion - 1) * 10000) / 100 + "%" : "0%"}
              </div>
            </div>
            <div className="flex justify-start items-center gap-2 p-2 border-t border-solid border-bddark">
              <div className="relative">
                <img src={materialIcon[props.material.marketName as keyof typeof materialIcon]} alt={props.material.marketName} className={"w-10 h-10 " + `${grade[props.material.grade]}`} />
                <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">5</span>
              </div>
              <span className={textColors[props.material.grade]}>{props.material.marketName}</span>
            </div>
            <i className="flex justify-center items-center xi-arrow-right p-2 border-t border-solid border-bddark"></i>
            <div className="flex justify-start items-center gap-2 p-2 border-t border-solid border-bddark">
              <div className="relative">
                <img src={materialIcon[props.material.convert.convertMaterial.marketName == "아비도스 철광석" ? "철광석" : "목재"]} alt={props.material.convert.convertMaterial.marketName} className={"w-10 h-10 " + `${grade["일반"]}`} />
                <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">50</span>
              </div>
              <span className={textColors["일반"]}>{props.material.convert.convertMaterial.marketName == "아비도스 철광석" ? "철광석" : "목재"}</span>
            </div>

            <div className="flex justify-start items-center gap-2 p-2 ">
              <div className="relative">
                <img src={materialIcon[props.material.convert.convertMaterial.marketName == "아비도스 철광석" ? "철광석" : "목재"]} alt={props.material.convert.convertMaterial.marketName} className={"w-10 h-10 " + `${grade["일반"]}`} />
                <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">100</span>
              </div>
              <span className={textColors["일반"]}>{props.material.convert.convertMaterial.marketName == "아비도스 철광석" ? "철광석" : "목재"}</span>
            </div>
            <i className="flex justify-center items-center xi-arrow-right p-2"></i>
            <div className="flex justify-start items-center gap-2 p-2">
              <div className="relative">
                <img
                  className={`w-10 h-10 ${grade.일반}`}
                  src={materialIcon[lastString === "들꽃" ? "채집의 가루" : lastString === "철광석" ? "채광의 가루" : lastString === "목재" ? "벌목의 가루" : lastString === "생고기" ? "수렵의 가루" : lastString === "유물" ? "고고학의 가루" : "낚시의 가루"]}
                  alt="가루"
                />
                <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">80</span>
              </div>
              <span>{lastString === "들꽃" ? "채집의 가루" : lastString === "철광석" ? "채광의 가루" : lastString === "목재" ? "벌목의 가루" : lastString === "생고기" ? "수렵의 가루" : lastString === "유물" ? "고고학의 가루" : "낚시의 가루"}</span>
            </div>

            {/*가루 -> 오레하 , 아비도스 */}
            <div className="flex justify-start items-center gap-2 p-2">
              <div className="relative">
                <img
                  className={`w-10 h-10 ${grade.일반}`}
                  src={materialIcon[lastString === "들꽃" ? "채집의 가루" : lastString === "철광석" ? "채광의 가루" : lastString === "목재" ? "벌목의 가루" : lastString === "생고기" ? "수렵의 가루" : lastString === "유물" ? "고고학의 가루" : "낚시의 가루"]}
                  alt="가루"
                />
                <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">100</span>
              </div>
              <span>{lastString === "들꽃" ? "채집의 가루" : lastString === "철광석" ? "채광의 가루" : lastString === "목재" ? "벌목의 가루" : lastString === "생고기" ? "수렵의 가루" : lastString === "유물" ? "고고학의 가루" : "낚시의 가루"}</span>
            </div>
            <i className="flex justify-center items-center xi-arrow-right p-2"></i>
            <div className="flex justify-start items-center gap-2 p-2">
              <div className="relative">
                <img src={materialIcon[props.material.convert.convertMaterial.marketName as keyof typeof materialIcon]} alt={props.material.convert.convertMaterial.marketName} className={"w-10 h-10 " + `${grade[props.material.convert.convertMaterial.grade]}`} />
                <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">10</span>
              </div>
              <span className={textColors[props.material.convert.convertMaterial.grade]}>{props.material.convert.convertMaterial.marketName}</span>
            </div>
          </>
        );
      }
    }
    // 오레하 , 아비도스, 진귀한 가죽,  진귀한 유물
    return (
      <>
        <div className="mt-3 col-span-3 flex justify-between items-center">
          <div className={"font-semibold " + `${textColors[props.material.grade]}`}>{props.material.marketName}</div>
          {/*이득률 */}
          <div className={"flex justify-start items-center font-semibold " + `${props.material.convert && props.material.convert.proportion > 0 ? "text-red-400" : "text-blue-400"}`}>
            이득률 : {props.material.convert && isFinite(props.material.convert.proportion) ? Math.round((props.material.convert.proportion - 1) * 10000) / 100 + "%" : "0%"}
          </div>
        </div>
        <div className="flex justify-start items-center gap-2 p-2 border-t border-solid border-bddark">
          <div className="relative">
            <img src={materialIcon[props.material.marketName as keyof typeof materialIcon]} alt={props.material.marketName} className={"w-10 h-10 " + `${grade[props.material.grade]}`} />
            <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">10</span>
          </div>
          <span className={textColors[props.material.grade]}>{props.material.marketName}</span>
        </div>
        <i className="flex justify-center items-center xi-arrow-right p-2 border-t border-solid border-bddark"></i>
        {props.material.convert ? (
          <div className="flex justify-start items-center gap-2 p-2 border-t border-solid border-bddark">
            <div className="relative">
              <img src={materialIcon[props.material.convert.convertMaterial.marketName as keyof typeof materialIcon]} alt={props.material.convert.convertMaterial.marketName} className={"w-10 h-10 " + `${grade[props.material.convert.convertMaterial.grade]}`} />
              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">10</span>
            </div>
            <span className={textColors[props.material.convert.convertMaterial.grade]}>{props.material.convert.convertMaterial.marketName}</span>
          </div>
        ) : (
          <div className="flex justify-start items-center gap-2 p-2 border-t border-solid border-bddark">
            <div className="relative">
              <img src={materialIcon[props.material.marketName as keyof typeof materialIcon]} alt={props.material.marketName} className={"w-10 h-10 " + `${grade[props.material.grade]}`} />
              <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">10</span>
            </div>
            <span className={textColors[props.material.grade]}>{props.material.marketName}</span>
          </div>
        )}
      </>
    );
  }
}

export default Material;
