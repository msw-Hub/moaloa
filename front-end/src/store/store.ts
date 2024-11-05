import { configureStore } from "@reduxjs/toolkit";
import darkMode from "./darkMode";

const store = configureStore({
  reducer: {
    dark: darkMode.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
