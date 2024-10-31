import { configureStore } from "@reduxjs/toolkit";
import darkMode from "./darkMode";
import modal from "./modal";

const store = configureStore({
  reducer: {
    dark: darkMode.reducer,
    modal: modal.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
