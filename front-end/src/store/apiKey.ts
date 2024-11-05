import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ApiKeyState {
  apiKey: string[];
}

const initialState: ApiKeyState = {
  apiKey: localStorage.apiKey ? JSON.parse(localStorage.apiKey) : ["", "", "", "", ""],
};

const apiKey = createSlice({
  name: "apiKey",
  initialState,
  reducers: {
    setApiKey: (state, action: PayloadAction<string[]>) => {
      localStorage.apiKey = JSON.stringify(action.payload);
      state.apiKey = action.payload;
    },
  },
});

export const { setApiKey } = apiKey.actions;
export default apiKey;
