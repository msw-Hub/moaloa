import axios from "axios";
import { MaterialMetas } from "../../metadatas/metadatas";
import React, { useEffect, useState } from "react";
import { useAlert } from "../../hooks/useAlert";
import materialIcon from "../../data/itemIcon.json";

//생활재료 가격 타입
interface Material {
  [key: string]: Item[];
}

interface Item {
  marketId: number;
  marketName: string;
  currentMinPrice: number;
  ydayAvgPrice: number;
  // originalMinPrice: number; // 기존 최저가 백업
  grade: string;
  ConvertList: ConvertList;
}

//생활재료 변환 정보 리스트
interface ConvertList {
  materialList: {
    Before: Convert;
    After: Convert;
  }[];
  materialConvertListSimplify: {
    Before: Convert;
    After: Convert;
  };
  proportion: number;
}

//생활재료 변환 정보
interface Convert {
  icon: string;
  grade: string;
  marketName: string;
  quantity?: number;
}

interface Grade {
  [key: string]: string;
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

function MaterialRe() {
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
        setMaterialList(addMaterialConversion(res.data.제작재료시세));
      })
      .catch((err) => {
        alertBox("목록을 불러오는데 실패했습니다.");
        console.error(err);
      });
  }

  //재료 변환 리스트 반환
  const addMaterialConversion = (materials: Material): Material => {
    const updatedMaterials = { ...materials };

    for (const updatedMaterial in updatedMaterials) {
      //생활 재료 리스트가 아니면 스킵[생활 재료는 9로 시작]
      if (updatedMaterial[0] !== "9" || (updatedMaterial !== "90200" && updatedMaterial !== "90300" && updatedMaterial !== "90400" && updatedMaterial !== "90500" && updatedMaterial !== "90600" && updatedMaterial !== "90700")) continue;
      const materialItem = updatedMaterials[updatedMaterial];

      //수수료 계산 함수
      const calc = (price: number) => {
        return price - Math.ceil(price * 0.05);
      };

      //계산 개수 비율
      const quantity = {
        일반: 5000,
        고급: 2500,
        희귀1: 500,
        희귀2: 400,
      };
      const bundle = 100; // 판매 단위 100개씩

      const 일반 = calc(materialItem[0].currentMinPrice) * (quantity["일반"] / bundle);
      const 고급 = calc(materialItem[1].currentMinPrice) * (quantity["고급"] / bundle);

      let 희귀1 = 0;
      //벌목, 채광 일때 희귀1 계산
      if (updatedMaterial === "90300" || updatedMaterial === "90400") {
        희귀1 = calc(materialItem[2].currentMinPrice) * (quantity["희귀1"] / bundle);
      }
      //나머지 일때 희귀1 계산
      else {
        희귀1 = calc(materialItem[2].currentMinPrice) * (quantity["희귀2"] / bundle);
      }

      const 희귀1변환 = calc(materialItem[2].currentMinPrice) * (quantity["희귀2"] / bundle);

      const 희귀2 = calc(materialItem[3].currentMinPrice) * (quantity["희귀2"] / bundle);

      const 가루아이콘 = {
        90200: "채집의 가루",
        90300: "벌목의 가루",
        90400: "채광의 가루",
        90500: "수렵의 가루",
        90600: "낚시의 가루",
        90700: "고고학의 가루",
      };

      //재료 변환 리스트 생성 함수
      const convertList = (before: number, after: number, proportionBefore: number, proportionAfter: number) => {
        //벌목 채광일때

        let convertLists = {
          materialList: [
            {
              Before: {
                icon: materialIcon[materialItem[before % 2].marketName as keyof typeof materialIcon],
                grade: before % 2 === 0 ? "일반" : "고급",
                marketName: materialItem[before % 2].marketName,
                quantity: before % 2 === 0 ? 100 : 50,
              },
              After: {
                icon: materialIcon[가루아이콘[updatedMaterial] as keyof typeof materialIcon],
                grade: "일반",
                marketName: 가루아이콘[updatedMaterial],
                quantity: 80,
              },
            },
            {
              Before: {
                icon: materialIcon[가루아이콘[updatedMaterial] as keyof typeof materialIcon],
                grade: "일반",
                marketName: 가루아이콘[updatedMaterial],
                quantity: 100,
              },
              After: {
                icon: materialIcon[materialItem[after].marketName as keyof typeof materialIcon],
                grade: "희귀",
                marketName: materialItem[after].marketName,
                quantity: 10,
              },
            },
          ],
          materialConvertListSimplify: {
            Before: {
              icon: materialIcon[materialItem[before].marketName as keyof typeof materialIcon],
              grade: before === 0 ? "일반" : "고급",
              marketName: materialItem[before].marketName,
            },
            After: {
              icon: materialIcon[materialItem[after].marketName as keyof typeof materialIcon],
              grade: "희귀",
              marketName: materialItem[after].marketName,
            },
          },
          proportion: proportionAfter / proportionBefore,
        };

        //벌목 채광일때 before가 희귀1이고 after가 희귀2일때 convertLists.materialList에 unshift후 convertLists.materialConvertListSimplify에 재정의
        if ((updatedMaterial === "90300" || updatedMaterial === "90400") && before === 2 && after === 3) {
          convertLists.materialList.unshift({
            Before: {
              icon: materialIcon[materialItem[2].marketName as keyof typeof materialIcon],
              grade: "희귀",
              marketName: materialItem[2].marketName,
              quantity: 5,
            },
            After: {
              icon: materialIcon[materialItem[0].marketName as keyof typeof materialIcon],
              grade: "일반",
              marketName: materialItem[0].marketName,
              quantity: 50,
            },
          });

          convertLists.materialConvertListSimplify = {
            Before: {
              icon: materialIcon[materialItem[2].marketName as keyof typeof materialIcon],
              grade: "희귀",
              marketName: materialItem[2].marketName,
            },
            After: {
              icon: materialIcon[materialItem[3].marketName as keyof typeof materialIcon],
              grade: "희귀",
              marketName: materialItem[3].marketName,
            },
          };
        }

        //벌목 채광일때 before가 희귀1이고 after가 일반일때 재정의
        else if ((updatedMaterial === "90300" || updatedMaterial === "90400") && before === 2 && after === 0) {
          convertLists = {
            materialList: [
              {
                Before: {
                  icon: materialIcon[materialItem[2].marketName as keyof typeof materialIcon],
                  grade: "희귀",
                  marketName: materialItem[2].marketName,
                  quantity: 5,
                },
                After: {
                  icon: materialIcon[materialItem[0].marketName as keyof typeof materialIcon],
                  grade: "일반",
                  marketName: materialItem[0].marketName,
                  quantity: 50,
                },
              },
            ],
            materialConvertListSimplify: {
              Before: {
                icon: materialIcon[materialItem[2].marketName as keyof typeof materialIcon],
                grade: "희귀",
                marketName: materialItem[2].marketName,
              },
              After: {
                icon: materialIcon[materialItem[0].marketName as keyof typeof materialIcon],
                grade: "일반",
                marketName: materialItem[0].marketName,
              },
            },
            proportion: proportionAfter / proportionBefore,
          };
        }

        //벌목 채광일때 before가 고급이고 after가 일반 일때 재정의
        else if ((updatedMaterial === "90300" || updatedMaterial === "90400") && before === 1 && after === 0) {
          convertLists = {
            materialList: [
              {
                Before: {
                  icon: materialIcon[materialItem[1].marketName as keyof typeof materialIcon],
                  grade: "고급",
                  marketName: materialItem[1].marketName,
                  quantity: 25,
                },
                After: {
                  icon: materialIcon[materialItem[0].marketName as keyof typeof materialIcon],
                  grade: "일반",
                  marketName: materialItem[0].marketName,
                  quantity: 50,
                },
              },
            ],
            materialConvertListSimplify: {
              Before: {
                icon: materialIcon[materialItem[1].marketName as keyof typeof materialIcon],
                grade: "고급",
                marketName: materialItem[1].marketName,
              },
              After: {
                icon: materialIcon[materialItem[0].marketName as keyof typeof materialIcon],
                grade: "일반",
                marketName: materialItem[0].marketName,
              },
            },
            proportion: proportionAfter / proportionBefore,
          };
        }

        //before가 after와 같을때
        else if (before === after) {
          convertLists = {
            materialList: [
              {
                Before: {
                  icon: materialIcon[materialItem[before].marketName as keyof typeof materialIcon],
                  grade: before === 0 ? "일반" : before === 1 ? "고급" : "희귀",
                  marketName: materialItem[before].marketName,
                  quantity: 0,
                },
                After: {
                  icon: materialIcon[materialItem[after].marketName as keyof typeof materialIcon],
                  grade: before === 0 ? "일반" : before === 1 ? "고급" : "희귀",
                  marketName: materialItem[after].marketName,
                  quantity: 0,
                },
              },
            ],
            materialConvertListSimplify: {
              Before: {
                icon: materialIcon[materialItem[before].marketName as keyof typeof materialIcon],
                grade: before === 0 ? "일반" : before === 1 ? "고급" : "희귀",
                marketName: materialItem[before].marketName,
              },
              After: {
                icon: materialIcon[materialItem[after].marketName as keyof typeof materialIcon],
                grade: before === 0 ? "일반" : before === 1 ? "고급" : "희귀",
                marketName: materialItem[after].marketName,
              },
            },
            proportion: proportionAfter / proportionBefore,
          };
        }

        return convertLists;
      };

      //재료 변환 리스트
      //일반재료
      //일반 -> 희귀1
      if (일반 < 희귀1변환 && 희귀2 <= 희귀1변환) updatedMaterials[updatedMaterial][0].ConvertList = convertList(0, 2, 일반, 희귀1변환);
      //일반 -> 희귀2
      else if (일반 < 희귀2 && 희귀1변환 <= 희귀2) updatedMaterials[updatedMaterial][0].ConvertList = convertList(0, 3, 일반, 희귀2);
      //일반 -> 일반
      else if (희귀1변환 < 일반 && 희귀2 < 일반) updatedMaterials[updatedMaterial][0].ConvertList = convertList(0, 0, 일반, 일반);

      //고급재료
      //벌목과 채광만 고급 -> 일반 추가
      if (updatedMaterial === "90300" || updatedMaterial === "90400") {
        //고급 -> 일반
        if (고급 < 일반 && 희귀1변환 < 일반 && 희귀2 < 일반) updatedMaterials[updatedMaterial][1].ConvertList = convertList(1, 0, 고급, 일반);
        //고급 -> 희귀1
        else if (고급 < 희귀1변환 && 일반 < 희귀1변환 && 희귀2 <= 희귀1변환) updatedMaterials[updatedMaterial][1].ConvertList = convertList(1, 2, 고급, 희귀1변환);
        //고급 -> 희귀2
        else if (고급 < 희귀2 && 희귀1변환 <= 희귀2 && 일반 < 희귀2) updatedMaterials[updatedMaterial][1].ConvertList = convertList(1, 3, 고급, 희귀2);
        //고급 -> 고급
        else if (희귀1변환 < 고급 && 희귀2 < 고급 && 일반 < 고급) updatedMaterials[updatedMaterial][1].ConvertList = convertList(1, 1, 고급, 고급);
      } else {
        //고급 -> 희귀1
        if (고급 < 희귀1변환 && 희귀2 <= 희귀1변환) updatedMaterials[updatedMaterial][1].ConvertList = convertList(1, 2, 고급, 희귀1변환);
        //고급 -> 희귀2
        else if (고급 < 희귀2 && 희귀1변환 <= 희귀2) updatedMaterials[updatedMaterial][1].ConvertList = convertList(1, 3, 고급, 희귀2);
        //고급 -> 고급
        else if (희귀1변환 < 고급 && 희귀2 < 고급) updatedMaterials[updatedMaterial][1].ConvertList = convertList(1, 1, 고급, 고급);
      }

      //희귀1재료
      //벌목과 채광만
      if (updatedMaterial === "90300" || updatedMaterial === "90400") {
        //희귀1 -> 일반
        if (희귀1 < 일반 && 희귀2 < 일반) updatedMaterials[updatedMaterial][2].ConvertList = convertList(2, 0, 희귀1, 일반);
        //희귀1 -> 희귀2
        else if (희귀1 <= 희귀2 && 일반 < 희귀2) updatedMaterials[updatedMaterial][2].ConvertList = convertList(2, 3, 희귀1, 희귀2);
        //흐귀1 -> 희귀1
        else if (일반 < 희귀1 && 희귀2 <= 희귀1) updatedMaterials[updatedMaterial][2].ConvertList = convertList(2, 2, 희귀1, 희귀1);
      }
      //나머지 희귀1재료는 재료 변경 불가능
      else updatedMaterials[updatedMaterial][2].ConvertList = convertList(2, 2, 희귀1, 희귀1);

      //희귀2재료는 재료 변경 불가능
      updatedMaterials[updatedMaterial][3].ConvertList = convertList(3, 3, 희귀2, 희귀2);

      if (updatedMaterials[updatedMaterial][4]) updatedMaterials[updatedMaterial][4].ConvertList = convertList(4, 4, 희귀2, 희귀2);
    }

    return updatedMaterials;
  };

  //재료 가격 수정
  const onMaterialPriceChange = (e: React.ChangeEvent<HTMLInputElement>, marketID: number, subCode: number) => {
    if (!materialList) return;

    const updatedMaterialList = { ...materialList };
    for (const materialKey in updatedMaterialList) {
      updatedMaterialList[materialKey] = updatedMaterialList[materialKey].map((item) => {
        const { ...rest } = item;
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

    setMaterialList(addMaterialConversion(updatedMaterialList));
  };

  // 컴포넌트가 마운트될 때 `getCraftList` 함수를 호출
  useEffect(() => {
    getCraftList();
  }, []);

  return (
    <>
      <MaterialMetas></MaterialMetas>
      {materialList && (
        <div className="sm:text-sm text-xs flex justify-center lg:items-start items-center lg:flex-row flex-col gap-4 p-2">
          <div className="flex flex-col justify-start items-center gap-4 max-w-[22rem]">
            <div className="content-box p-4 flex justify-center items-center col-span-1 w-full gap-1">
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

            {materialList[categoryState][0].ConvertList.materialList && (
              <div className="flex flex-col gap-1">
                {materialList[categoryState].map((material) => {
                  return <MaterialConvertItem key={material.marketId} convertList={material.ConvertList} simplify={simplify}></MaterialConvertItem>;
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function MaterialConvertItem(props: { convertList: ConvertList; simplify: boolean }) {
  //재료 아이템 리스트
  const materialList = props.convertList.materialList;
  //간소화 정보
  const simplify = props.convertList.materialConvertListSimplify;

  //간소화 quantitiy 표시 안함
  if (props.simplify) {
    return (
      <>
        <div className="mt-3 col-span-3 flex justify-between items-center">
          <div className={"font-semibold " + `${textColors[simplify.Before.grade]}`}>{simplify.Before.marketName}</div>
          {/*이득률 */}
          <div className={"flex justify-start items-center font-semibold " + `${props.convertList.proportion !== 1 ? "text-red-400" : "text-blue-400"}`}>이득률 : {isFinite(props.convertList.proportion) ? Math.round((props.convertList.proportion - 1) * 1000) / 10 + "%" : "0%"}</div>
        </div>
        <div className="lg:w-[500px] grid grid-cols-[1fr_0.3fr_1fr] gap-y-1 font-semibold">
          <div className="flex justify-start items-center gap-2 p-2 border-t border-solid border-bddark">
            <img src={materialIcon[simplify.Before.marketName as keyof typeof materialIcon]} alt={simplify.Before.marketName} className={"w-10 h-10 " + `${grade[simplify.Before.grade]}`} />
            <span className={textColors[simplify.Before.grade]}>{simplify.Before.marketName}</span>
          </div>
          <i className="flex justify-center items-center xi-arrow-right p-2 border-t border-solid border-bddark"></i>
          <div className="flex justify-start items-center gap-2 p-2 border-t border-solid border-bddark">
            <img src={materialIcon[simplify.After.marketName as keyof typeof materialIcon]} alt={simplify.After.marketName} className={"w-10 h-10 " + `${grade[simplify.After.grade]}`} />
            <span className={textColors[simplify.After.grade]}>{simplify.After.marketName}</span>
          </div>
        </div>
      </>
    );
  }

  //간소화 x
  return (
    <>
      <div className="mt-3 col-span-3 flex justify-between items-center">
        <div className={"font-semibold " + `${textColors[simplify.Before.grade]}`}>{simplify.Before.marketName}</div>
        {/*이득률 */}
        <div className={"flex justify-start items-center font-semibold " + `${props.convertList.proportion !== 1 ? "text-red-400" : "text-blue-400"}`}>이득률 : {isFinite(props.convertList.proportion) ? Math.round((props.convertList.proportion - 1) * 1000) / 10 + "%" : "0%"}</div>
      </div>
      <div className="lg:w-[500px] grid grid-cols-[1fr_0.3fr_1fr] gap-y-1 font-semibold border-t border-solid border-bddark">
        {materialList.map((material, index) => {
          return (
            <React.Fragment key={material.Before.marketName + index}>
              <div className="flex justify-start items-center gap-2 p-2 ">
                <div className="relative">
                  <img src={materialIcon[material.Before.marketName as keyof typeof materialIcon]} alt={material.Before.marketName} className={"w-10 h-10 " + `${grade[material.Before.grade]}`} />
                  <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{material.Before.quantity === 0 ? "" : material.Before.quantity}</span>
                </div>
                <span className={textColors[material.Before.grade]}>{material.Before.marketName}</span>
              </div>
              <i className="flex justify-center items-center xi-arrow-right p-2 "></i>
              <div className="flex justify-start items-center gap-2 p-2 ">
                <div className="relative">
                  <img src={materialIcon[material.After.marketName as keyof typeof materialIcon]} alt={material.After.marketName} className={"w-10 h-10 " + `${grade[material.After.grade]}`} />
                  <span className="absolute bottom-0 right-[0.125rem] text-xs font-semibold text-white">{material.After.quantity === 0 ? "" : material.After.quantity}</span>
                </div>
                <span className={textColors[material.After.grade]}>{material.After.marketName}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}

export default MaterialRe;
