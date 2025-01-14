import { useNavigate } from "react-router-dom";
import { DefaultMetas } from "../../metadatas/metadatas";

function Home() {
  const menuList = [
    {
      title: "보석검색",
      description: "보석을 판매할때 각 보석별 최저가를 알려주는 기능을 제공합니다.",
      navurl: "/gemsearch",
    },
    {
      title: "영지제작",
      description: "제작법의 최적의 제작비용을 계산하여 알려주는 기능을 제공합니다.",
      navurl: "/craft",
    },
    {
      title: "생활재료판매",
      description: "생활재료를 판매할때 최대 효율을 알려주는 기능을 제공합니다.",
      navurl: "/material",
    },
    {
      title: "경매계산",
      description: "경매 입찰시 적정 입찰비용을 알려주는 기능을 제공합니다.",
      navurl: "/auction",
    },
  ];

  const devList = [
    {
      title: "GitHub",
      description: "GitHub 오픈소스",
      url: "https://github.com/msw-Hub/moaloa",
    },
    {
      title: "개선사항 및 버그 문의",
      description: "moaloa65@gmail.com",
    },
  ];

  return (
    <>
      <DefaultMetas />
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center justify-center">
          <img className="lg:w-32 lg:h-32 w-20 h-20" src="/logo.png" alt="logo" />
          <h1 className="lg:text-[3.5rem] text-[3rem] font-extrabold logotext text-blue-400 dark:text-white">MoaLoa</h1>
          <h2 className="text opacity-50">로스트아크 도구 모음 사이트</h2>
        </div>
        {/*메뉴*/}
        <div className="flex flex-col justify-center items-center gap-2">
          <span className="text-xl font-semibold">기능</span>
          <div className="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
            {/*선*/}
            <div className="lg:col-span-4 sm:col-span-2 col-span-1 border border-solid border-bddark border-opacity-50"></div>
            {menuList.map((menu) => (
              <InfoCard key={menu.title} title={menu.title} description={menu.description} navurl={menu.navurl} />
            ))}
          </div>
        </div>
        {/*깃허브*/}
        <div className="flex flex-col justify-center items-center gap-2">
          <span className="text-xl font-semibold">개발</span>
          <div className="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
            {/*선*/}
            <div className="lg:col-span-4 sm:col-span-2 col-span-1 border border-solid border-bddark border-opacity-50"></div>
            {devList.map((menu) => (
              <div key={menu.title} className="lg:col-span-2 sm:col-span-2 col-span-1">
                <InfoCard title={menu.title} description={menu.description} url={menu.url} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

//title, description, url, navurl을 받아서 카드형식으로 만들어줌
//url이나 navurl이 있을때 클릭시 이동
function InfoCard({ title, description, navurl, url }: { title: string; description: string; navurl?: string; url?: string }) {
  const navigateFC = useNavigate();

  return (
    <div
      onClick={() => {
        if (url) window.open(url, "_blank");
        if (navurl) navigateFC(`${navurl}`);
      }}
      className={"content-box p-4 flex flex-col justify-center items-center gap-4 w-60 h-36 " + `${url || navurl ? "cursor-pointer hover:bg-[#d2d2d2] dark:hover:bg-hoverdark transition-all duration-500" : ""}`}>
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="w-full border border-solid border-bddark border-opacity-50"></div>
      <p className="text-sm text-center text-balance">{description}</p>
    </div>
  );
}

export default Home;
