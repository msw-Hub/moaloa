import { configureStore } from "@reduxjs/toolkit";
import darkMode from "./darkMode";
import modal from "./modal";
import apiKey from "./apiKey";

const store = configureStore({
  reducer: {
    dark: darkMode.reducer,
    modal: modal.reducer,
    apiKeys: apiKey.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
