import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { toggleDarkMode } from "../store/darkMode";

export type useDark = [boolean, (text: string) => void];

const useDarkMode = (): useDark => {
  const isDark = useSelector((state: RootState) => state.dark.isDark);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isDark) {
      localStorage.theme = "dark";
      document.documentElement.classList.add("dark");
    } else {
      localStorage.theme = "light";
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const onToggleDarkMode = (text: string): void => {
    dispatch(toggleDarkMode(text));
  };

  return [isDark, onToggleDarkMode];
};

export default useDarkMode;
