import { Route, Routes, useNavigate } from "react-router-dom";
import useDarkMode from "./hooks/useDarkMode";
import GemSearch from "./Router/gemSearch/GemSearch";
import { useSelector } from "react-redux";
import { Modal } from "./components/modal";
import Craft from "./Router/craft/Craft";
import CraftDetail from "./Router/craft/CraftDetail";
import { RootState } from "./store/store";
import { setApiKey } from "./store/apiKey";
import { useState } from "react";

function App() {
  const [darkMode, setDarkMode] = useDarkMode();
  const navigate = useNavigate();
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false); //api모달
  const apiKey = useSelector<RootState, string[]>((state) => state.apiKeys.apiKey);

  return (
    <>
      {/*네비게이션*/}
      <nav className="z-10 flex items-center justify-between fixed top-0 left-0 right-0 h-16 shadow-md bg-light dark:bg-bgdark">
        <div className="flex justify-center items-center">
          {/*로고*/}
          <div className="flex items-center justify-center h-full mx-6">
            <button onClick={() => navigate("/")} className="text-2xl font-extrabold">
              MoaLoa
            </button>
          </div>
          {/*메뉴*/}
          <div className="flex items-center justify-center h-full gap-4">
            <button onClick={() => navigate("/gemSerch")} className="navBtn flex items-center justify-center">
              보석검색
            </button>
            <button onClick={() => navigate("/craft")} className="navBtn flex items-center justify-center">
              영지제작
            </button>
            <button onClick={() => {}} className="navBtn flex items-center justify-center">
              경매계산
            </button>
          </div>
        </div>
        {/*다크모드 / api키 버튼*/}
        <div className=" flex items-center justify-center mx-6 gap-5">
          <button onClick={() => setApiKeyModalOpen(true)} className="navBtn flex items-center justify-center">
            API키
          </button>
          <button
            onClick={(): void => {
              setDarkMode("");
            }}
            className="flex justify-center items-center">
            {darkMode === true ? <i className="xi-moon xi-x"></i> : <i className="xi-brightness xi-x"></i>}
          </button>
        </div>
        {/*api모달*/}
        <Modal isOpen={apiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)}>
          <div className="flex flex-col items-center bg-light dark:bg-ctdark rounded-md p-8 w-[500px] gap-2">
            {/* API KEY 입력 5칸 */}
            <div className="w-full flex justify-between items-center">
              <span className="font-semibold">API키 입력</span>
              <button onClick={() => window.open("https://developer-lostark.game.onstove.com/", "_blank")} className="font-medium text-sm py-2 px-4 bg-light dark:bg-ctdark dark:border-bddark border-bddark border border-solid rounded-md">
                API키 발급
              </button>
            </div>
            {apiKey.map((key: string, i: number) => (
              <input
                className="bg-light dark:bg-ctdark dark:border-bddark border-bddark border border-solid rounded-md p-2 w-full"
                key={i}
                type="text"
                onChange={(e) => {
                  let copy = [...apiKey];
                  copy[i] = e.target.value;
                  setApiKey(copy);
                }}
                value={key}
                placeholder="API 키"
              />
            ))}
          </div>
        </Modal>
      </nav>
      <div className="min-h-screen flex flex-col justify-between items-center mt-16 pt-10">
        {/*nav여백*/}
        {/*라우터*/}
        <Routes>
          {/*메인페이지*/}
          <Route path="/" element={<div></div>}></Route>
          {/*보석 검색 페이지*/}
          <Route path="/gemSerch" element={<GemSearch></GemSearch>}></Route>
          {/*영지 제작 페이지*/}
          <Route path="/craft" element={<Craft></Craft>}></Route>
          {/*영지 제작 페이지 detail*/}
          <Route path="/craft/:id" element={<CraftDetail></CraftDetail>}></Route>
        </Routes>
        <footer className="font-semibold flex flex-col justify-center items-center py-6">
          <div>@2024 moaloa All rights reserved</div>
          <div>This site is not associated with Smilegate RPG & Smilegate Stove.</div>
        </footer>
      </div>
    </>
  );
}

export default App;
