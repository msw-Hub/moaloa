import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { alertOff, alertOn } from "../store/alertBox";

//useAlert 함수
export const useAlert = () => {
  let dispatch = useDispatch(); //dispatch 함수
  const timerRef = useRef<number | null>(null); //타이머

  //alert 함수
  const triggerAlert = (text: string) => {
    dispatch(alertOn(text));
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      dispatch(alertOff());
    }, 3000) as unknown as number;
  };

  return triggerAlert;
};

//AlertText 컴포넌트
export function AlertText() {
  let alertBox = useSelector((state: any) => state.alertbox); //alertbox state
  return (
    <div className={`content-box border-2 border-solid  font-bold fixed top-24 left-1/2 transform -translate-x-1/2 transition-all ease-in-out duration-1000 px-5 py-2.5 whitespace-nowrap bg-opacity-70 ${alertBox.state ? " translate-y-2 z-50 opacity-100" : " -z-10 opacity-0"}`}>{alertBox.text}</div>
  );
}
