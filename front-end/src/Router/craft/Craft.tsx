import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "../../components/modal";
import craftListData from "../../data/craftList.json";

type CraftList = {
  id: number;
  marketId: number;
  craftName: string;
  marketName: string;
  subCode: number;
  craftQuantity: number;
  bundleCount: number;
  craftPrice: number;
  activityPrice: number;
  exp: number;
  craftTime: number;
  iconLink: string;
  grade: string;
  currentMinPrice: number;
  recentPrice: number;
  yDayAvgPrice: number;
};

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
  const [craftList, setCraftList] = useState<CraftList[]>([]);
  const [craftModalOpen, setCraftModalOpen] = useState(false);
  const [craftEffect, setCraftEffect] = useState<CraftEffect>(getInitialCraftEffect);
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
    axios("/api/v1/craft/loaApi")
      .then((res) => {
        setCraftList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //임시데이터

  useEffect(() => {
    setCraftList(craftListData);
  }, []);

  // craftEffect 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("craftEffect", JSON.stringify(craftEffect));
  }, [craftEffect]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div>
        <button onClick={() => setCraftModalOpen(true)} className="navBtn flex items-center justify-center">
          영지효과
        </button>
        {/* 제작품 목록 */}
        <div className="grid grid-cols-[5fr_1fr_1fr_1fr] gap-4 p-8 content-box ">
          <span>제작법</span>
          <span>판매차익(골드)</span>
          <span>원가이익률(%)</span>
          <span>활동력이익률(%)</span>
          {craftList.map((craft) => {
            return (
              <React.Fragment key={craft.id}>
                <div className="flex justify-start items-center gap-4">
                  <img src={craft.iconLink} alt={craft.craftName} className={"w-10 h-10 " + `${grade[craft.grade]}`} />
                  <span className="text-sm font-semibold">{craft.craftName}</span>
                </div>
                <span className="text-sm font-semibold">0</span>
                <span className="text-sm font-semibold">0</span>
                <span className="text-sm font-semibold">0</span>
              </React.Fragment>
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
                          value={craftEffect[effect][index]}
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
  );
}

export default Craft;
