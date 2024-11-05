import { Route, Routes, useNavigate } from "react-router-dom";
import useDarkMode from "./hooks/useDarkMode";

function App() {
  const [darkMode, setDarkMode] = useDarkMode();
  const naivgate = useNavigate();

  return (
    <>
      {/*네비게이션*/}
      <nav className="flex items-center justify-between fixed top-0 left-0 right-0 h-16 border-b-2 border-solid border-ctdark">
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
        {/*다크모드*/}
        <div className=" flex items-center justify-center mx-6">
          <button
            onClick={(): void => {
              setDarkMode("");
            }}
            className="flex justify-center items-center">
            {darkMode === true ? <i className="xi-moon xi-x"></i> : <i className="xi-brightness xi-x"></i>}
          </button>
        </div>
      </nav>
      <Routes>
        {/*보석 검색 페이지*/}
        <Route path="/gemSerch" element={<div></div>}></Route>
      </Routes>
    </>
  );
}

export default App;
