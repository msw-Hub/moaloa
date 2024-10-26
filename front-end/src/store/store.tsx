import { configureStore } from "@reduxjs/toolkit";

let store = configureStore({
  reducer: {},
});

type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
