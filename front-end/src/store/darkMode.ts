import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DarkModeState {
  isDark: boolean;
}

const initialState: DarkModeState = {
  isDark: localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches),
};

const darkMode = createSlice({
  name: "darkMode",
  initialState,
  reducers: {
    toggleDarkMode: (state, action: PayloadAction<string>) => {
      const update = !state.isDark;
      console.log(action.payload);
      if (update) {
        localStorage.theme = "dark";
      } else {
        localStorage.theme = "light";
      }
      state.isDark = update;
    },
  },
});

export const { toggleDarkMode } = darkMode.actions;
export default darkMode;
