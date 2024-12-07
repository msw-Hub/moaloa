import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialAlertboxState: { state: boolean; text: string } = { state: false, text: "" };

let alertbox = createSlice({
  name: "alertbox",
  initialState: initialAlertboxState,
  reducers: {
    alertOn(state, action: PayloadAction<string>) {
      state.state = true;
      state.text = action.payload;
    },
    alertOff(state) {
      state.state = false;
    },
  },
});

export const { alertOn, alertOff } = alertbox.actions;
export default alertbox;
