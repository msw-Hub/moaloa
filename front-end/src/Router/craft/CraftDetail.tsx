import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import itemIcon from "../../data/itemIcon.json";

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

interface CraftDetail {
  제작아이템: CraftItem;
  갱신시간: string;
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
  // URL 파라미터 값 가져오기
  const id = useParams().id;

  //시세 기준 (현재 최저가 : currentMinPrice, 전날가격 : ydayAvgPrice )
  const [priceStandard, setPriceStandard] = useState<string>("currentMinPrice");
  const [craftDetail, setCraftDetail] = useState<CraftDetail>();
  const [materialList, setMaterialList] = useState<Material>();
  const [craftEffect] = useState<CraftEffect>(getInitialCraftEffect);

  useEffect(() => {
    calculateCraftPriceAll();
  }, [priceStandard]);

  function getCraftDetail() {
    axios
      .get(`/api/v1/craft/readData?craftItemId=${id}`)
      .then((res) => {
        const updatedCraftItem = calculateCraftValues(res.data["제작아이템"]);
        setCraftDetail({ ...res.data, 제작아이템: { ...res.data["제작아이템"], ...updatedCraftItem } });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function getMaterialPrice() {
    axios
      .get("/api/v1/craft/readLifeData")
      .then((res) => {
        setMaterialList(materialConversion(res.data["생활재료시세"]));
      })
      .catch((err) => {
        console.log(err);
      });
  }

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
    const totalCraftCost = totalMaterialCost + craftItem.craftPrice * (1 - 0.01 * (craftEffect["제작수수료 감소"][0] + craftEffect["제작수수료 감소"][craftItem.category]));
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
    if (!craftDetail) return;
    const updatedCraftList = calculateCraftValues(craftDetail.제작아이템);
    setCraftDetail({ ...craftDetail, 제작아이템: { ...craftDetail.제작아이템, ...updatedCraftList } });
  }

  useEffect(() => {
    getCraftDetail();
    getMaterialPrice();
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

  return (
    craftDetail && (
      <div className="w-[1000px] p-6 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{craftDetail.제작아이템.craftName}</h1>
          <p className="text-sm text-gray-500">갱신시간: {craftDetail.갱신시간}</p>
        </div>
        <div className="col-span-3 flex justify-center items-center gap-4">
          <span>판매기준</span>
          <select className="py-2 rounded-md bg-[#e3e3e3] dark:bg-bgdark text-center" onChange={(e) => setPriceStandard(e.target.value)} defaultValue={priceStandard}>
            <option className="font-semibold" value="currentMinPrice">
              현재 최저가
            </option>
            <option className="font-semibold" value="ydayAvgPrice">
              전날 평균 가격
            </option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {/* 제작 정보 */}
          <div className="p-4 content-box">
            <h2 className="font-bold text-lg mb-4">제작 정보</h2>
            <ul className="space-y-2">
              <li>제작단위: {craftDetail.제작아이템.craftQuantity}</li>
              <li>활동력: {craftDetail.제작아이템.activityPrice}</li>
              <li>제작시간: {craftDetail.제작아이템.craftTime}초</li>
              <li>경험치: {craftDetail.제작아이템.exp}</li>
              <li>제작비용: {craftDetail.제작아이템.craftPriceAll} 골드</li>
            </ul>
          </div>

          {/* 판매 정보 */}
          <div className="p-4 content-box">
            <h2 className="font-bold text-lg mb-4">판매 정보</h2>
            <ul className="space-y-2">
              <li>판매단위: {craftDetail.제작아이템.bundleCount}</li>
              <li>시세: {priceStandard === "currentMinPrice" ? <span className="text-center text-sm font-semibold">{craftDetail?.제작아이템.currentMinPrice}</span> : <span className="text-center text-sm font-semibold">{Math.round(craftDetail?.제작아이템.ydayAvgPrice)}</span>} 골드</li>
              <li>판매 차익: {craftDetail.제작아이템.craftSellPrice} 골드</li>
              <li>원가 이익률: {craftDetail.제작아이템.craftCostMargin}%</li>
            </ul>
          </div>
        </div>

        {/* 재료 정보 */}
        <div className="p-4 content-box">
          <h2 className="font-bold text-lg mb-4">재료 정보</h2>
          <div>
            <div className="grid grid-cols-4 text-center">
              <div className="">재료</div>
              <div className="">시세</div>
              <div className="">단가</div>
              <div className="">합계</div>
            </div>
            <div>
              {craftDetail.제작아이템.craftMaterials.map((material, index) => (
                <div className="grid grid-cols-4 gap-4" key={index}>
                  <div className="flex items-center">
                    <div className="relative">
                      <img src={material.iconLink} alt={material.marketName} className={"w-10 h-10 " + `${grade[material.grade]}`} />
                      <span className="absolute bottom-0 right-0 text-xs font-semibold">{material.quantity}</span>
                    </div>
                    <span className="ml-2">{material.marketName}</span>
                  </div>
                  <input defaultValue={material.currentMinPrice} className="bg-light dark:bg-bgdark dark:border-bddark border-bddark rounded-md p-2" type="text" />
                  <div className="">{material.currentMinPrice / material.bundleCount} 골드</div>
                  <div className="">{(material.quantity * material.currentMinPrice) / material.bundleCount} 골드</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* 생활재료 교환 정보 */}

        <div>
          {/*채광 벌목만 일반등급중 currentMinPrice가 있으면 변환 */}
          <div className="p-4 content-box">
            <h2 className="font-bold text-lg mb-4">생활재료 교환 정보</h2>
            {}
          </div>
        </div>
      </div>
    )
  );
}

export default CraftDetail;
