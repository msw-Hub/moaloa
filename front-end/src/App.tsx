import { Route, Routes, useNavigate } from "react-router-dom";
import useDarkMode from "./hooks/useDarkMode";
import GemSearch from "./Router/GemSearch";
import { useDispatch } from "react-redux";
import { toggleModal } from "./store/modal";
import { Modal } from "./components/modal";

function App() {
  const [darkMode, setDarkMode] = useDarkMode();
  const dispatch = useDispatch();
  const naivgate = useNavigate();

  return (
    <>
      {/*네비게이션*/}
      <nav className="flex items-center justify-between fixed top-0 left-0 right-0 h-16 shadow-md">
        <div className="flex justify-center items-center">
          {/*로고*/}
          <div className="flex items-center justify-center h-full mx-6">
            <button onClick={() => naivgate("/")} className="text-2xl font-extrabold">
              MoaLoa
            </button>
          </div>
          {/*메뉴*/}
          <div className="flex items-center justify-center h-full gap-4">
            <button onClick={() => naivgate("/gemSerch")} className="btn flex items-center justify-center ">
              보석검색
            </button>
            <button onClick={() => {}} className="btn flex items-center justify-center">
              영지제작
            </button>
            <button onClick={() => {}} className="btn flex items-center justify-center">
              경매계산
            </button>
          </div>
        </div>
        {/*다크모드 / api키 버튼*/}
        <div className=" flex items-center justify-center mx-6 gap-5">
          <button onClick={() => dispatch(toggleModal())} className="btn flex items-center justify-center">
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
        <Modal></Modal>
      </nav>
      <Routes>
        {/*보석 검색 페이지*/}
        <Route path="/gemSerch" element={<GemSearch></GemSearch>}></Route>
      </Routes>
    </>
  );
}

export default App;
