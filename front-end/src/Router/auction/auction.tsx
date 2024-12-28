import { useEffect, useState } from "react";
import { useAlert } from "../../hooks/useAlert";
import { AuctionMetas } from "../../metadatas/metadatas";

interface Auction {
  commission: number; //판매 수수료

  bEPPrice: number; //손익분기점
  bEPPriceProfit: number; //판매 차익
  bEPPriceDistribution: number; //분배금

  bidPrice: number; //입찰적정가
  bidPriceProfit: number; //판매 차익
  bidPriceDistribution: number; //분배금

  gainPrice: number; //이득 적정 입찰가
  gainPriceProfit: number; //판매 차익
  gainPriceDistribution: number; //분배금
}

function Auction() {
  const goldIcon = "/itemIcon/gold.webp";
  const alertBox = useAlert();

  const [auctionPrice, setAuctionPrice] = useState<number>(0);
  const [people, setPeople] = useState<number>(8);
  const [profitRate, setProfitRate] = useState<number>(70);

  const [auction, setAuction] = useState<Auction>({
    commission: 0,

    bEPPrice: 0,
    bEPPriceProfit: 0,
    bEPPriceDistribution: 0,

    bidPrice: 0,
    bidPriceProfit: 0,
    bidPriceDistribution: 0,

    gainPrice: 0,
    gainPriceProfit: 0,
    gainPriceDistribution: 0,
  });
  useEffect(() => {
    if (people === 0) {
      setAuction({
        commission: 0,

        bEPPrice: 0,
        bEPPriceProfit: 0,
        bEPPriceDistribution: 0,

        bidPrice: 0,
        bidPriceProfit: 0,
        bidPriceDistribution: 0,

        gainPrice: 0,
        gainPriceProfit: 0,
        gainPriceDistribution: 0,
      });
      return;
    }
    const sellPrice = Math.floor(auctionPrice * 0.95);
    const commission = Math.floor(auctionPrice * 0.05);
    const bEPPrice = sellPrice - sellPrice / people;
    const bEPPriceProfit = sellPrice - (sellPrice - sellPrice / people);
    const bEPPriceDistribution = sellPrice / people;

    const bidPriceProfit = sellPrice - (sellPrice - sellPrice / people) / 1.1;

    const profitRateTest = people * 10 * (0.01 * profitRate);
    const gain = getAuctionPrice(1 + 0.01 * profitRateTest, people, auctionPrice);

    setAuction({
      commission: Math.floor(commission),

      bEPPrice: Math.floor(bEPPrice),
      bEPPriceProfit: Math.floor(bEPPriceProfit),
      bEPPriceDistribution: Math.floor(bEPPriceDistribution),

      bidPrice: Math.floor(bEPPrice / 1.1),
      bidPriceProfit: Math.floor(bidPriceProfit),
      bidPriceDistribution: Math.floor(bEPPriceDistribution / 1.1),

      gainPrice: Math.floor(gain[1] * (people - 1)),
      gainPriceProfit: Math.floor(gain[0]),
      gainPriceDistribution: Math.floor(gain[1]),
    });
  }, [auctionPrice, people, profitRate]);

  function getAuctionPrice(profitRate: number, people: number, auctionPrice: number) {
    auctionPrice = auctionPrice - Math.floor(auctionPrice * 0.05);
    const y = auctionPrice / (profitRate + people - 1);
    const x = profitRate * y;
    return [x, y];
  }

  //텍스트 복사
  function textCopy(text: number) {
    navigator.clipboard.writeText(text.toString());
  }

  return (
    <div className="md:text-base text-sm grid grid-cols-2 gap-4 max-w-[550px] w-full font-medium p-2">
      <AuctionMetas></AuctionMetas>
      {/* 가격 , 인원 , 이득률 퍼센트 설정 */}
      <div className="content-box col-span-2 grid grid-cols-1 gap-4 p-4 font-medium">
        <h1 className="font-bold">경매 계산기</h1>
        <input className="content-box border-solid border border-bddark p-4" onFocus={(e) => e.target.select()} type="number" placeholder="가격" onChange={(e) => setAuctionPrice(Number(e.target.value))} />
        <div className="flex justify-evenly items-center  text-nowrap">
          {[4, 8, 16, 35].map((v) => (
            <div key={v} className="flex justify-center items-center gap-1 cursor-pointer" onClick={() => setPeople(v)}>
              {people === v ? <i className="xi-radiobox-checked xi-x text-blue-400 dark:text-light"></i> : <i className="xi-radiobox-blank xi-x text-blue-400 dark:text-light"></i>}
              {v == 25 ? "필드보스" : `${v}인`}
            </div>
          ))}
        </div>

        <div className="flex justify-start items-center gap-2 mb-4">
          <div className="font-semibold">이득률</div>
          <div>{`[ 0% ~ ${people * 10}% ]`}</div>
        </div>
        <div className="relative flex justify-between items-center w-full">
          <input className="w-full dark:accent-light" step={5} defaultValue={70} min={0} max={100} type="range" placeholder="이득률" onChange={(e) => setProfitRate(Number(e.target.value))} />
          <div className="absolute left-0 -top-6 text-bddark">N빵 입찰가</div>
          <div className="absolute right-0 -top-6 text-bddark">입찰적정가</div>
        </div>
      </div>
      {/*입찰적정가 */}
      <div className="content-box p-4 flex flex-col justify-start gap-3">
        <h2 className="font-bold">N빵 입찰가</h2>
        <div className="flex justify-between items-center">
          <div>금액</div>
          <div
            onClick={() => {
              textCopy(auction.bEPPrice);
              alertBox("복사되었습니다.");
            }}
            className="flex justify-center items-center gap-1 cursor-pointer">
            <i className="xi-documents-o pb-1"></i>
            <div>{auction.bEPPrice.toLocaleString()}</div>
            <img className="w-5 h-5" src={goldIcon} alt="gold" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>판매 차익</div>
          <div className="flex justify-center items-center gap-1">
            <div>{auction.bEPPriceProfit.toLocaleString()}</div>
            <img className="w-5 h-5" src={goldIcon} alt="gold" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>분배금</div>
          <div className="flex justify-center items-center gap-1">
            <div>{auction.bEPPriceDistribution.toLocaleString()}</div>
            <img className="w-5 h-5" src={goldIcon} alt="gold" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>이득금</div>
          <div className="flex justify-center items-center gap-1">
            <div className="text-red-400">{(auction.bEPPriceProfit - auction.bEPPriceDistribution).toLocaleString()}</div>
            <img className="w-5 h-5" src={goldIcon} alt="gold" />
          </div>
        </div>
      </div>
      {/*손익분기점 */}
      <div className="content-box p-4 flex  flex-col justify-start gap-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold">입찰적정가</h2>
          {/* <div className="flex justify-start items-center gap-1 text-sm">
            <span>수수료 : </span>
            <div>{auction.commission.toLocaleString()}</div>
            <img className="w-4 h-4" src={goldIcon} alt="gold" />
          </div> */}
        </div>
        <div className="flex justify-between items-center">
          <div>금액</div>
          <div
            onClick={() => {
              textCopy(auction.bidPrice);
              alertBox("복사되었습니다.");
            }}
            className="flex justify-center items-center gap-1 cursor-pointer">
            <i className="xi-documents-o pb-1"></i>
            <div>{auction.bidPrice.toLocaleString()}</div>
            <img className="w-5 h-5" src={goldIcon} alt="gold" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>판매 차익</div>
          <div className="flex justify-center items-center gap-1">
            <div>{auction.bidPriceProfit.toLocaleString()}</div>
            <img className="w-5 h-5" src={goldIcon} alt="gold" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>분배금</div>
          <div className="flex justify-center items-center gap-1">
            <div>{auction.bidPriceDistribution.toLocaleString()}</div>
            <img className="w-5 h-5" src={goldIcon} alt="gold" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>이득금</div>
          <div className="flex justify-center items-center gap-1">
            <div className="text-red-400">{(auction.bidPriceProfit - auction.bidPriceDistribution).toLocaleString()}</div>
            <img className="w-5 h-5" src={goldIcon} alt="gold" />
          </div>
        </div>
      </div>

      <div className="col-span-2 content-box p-4 flex flex-col justify-start gap-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold">이득률 계산</h2>
          <div className="flex justify-start items-center gap-1 font-bold text-red-400">
            <div>이득률 : </div>
            <div>{Math.floor(people * 10 * (0.01 * profitRate)).toLocaleString()}%</div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>금액</div>
          <div
            onClick={() => {
              textCopy(auction.gainPrice);
              alertBox("복사되었습니다.");
            }}
            className="flex justify-center items-center gap-1 cursor-pointer">
            <i className="xi-documents-o pb-1"></i>
            <div>{auction.gainPrice.toLocaleString()}</div>
            <img className="w-5 h-5" src={goldIcon} alt="gold" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>판매 차익</div>
          <div className="flex justify-center items-center gap-1">
            <div>{auction.gainPriceProfit.toLocaleString()}</div>
            <img className="w-5 h-5" src={goldIcon} alt="gold" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>분배금</div>
          <div className="flex justify-center items-center gap-1">
            <div>{auction.gainPriceDistribution.toLocaleString()}</div>
            <img className="w-5 h-5" src={goldIcon} alt="gold" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>이득금</div>
          <div className="flex justify-center items-center gap-1">
            <div className="text-red-400">{(auction.gainPriceProfit - auction.gainPriceDistribution).toLocaleString()}</div>
            <img className="w-5 h-5" src={goldIcon} alt="gold" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auction;
