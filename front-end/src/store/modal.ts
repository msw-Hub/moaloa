import { createSlice } from "@reduxjs/toolkit";

interface ModalState {
  isModal: boolean;
}

const initialState: ModalState = {
  isModal: false,
};

const modal = createSlice({
  name: "modal",
  initialState,
  reducers: {
    toggleModal: (state) => {
      console.log(state.isModal);
      state.isModal = !state.isModal;
    },
  },
});

export const { toggleModal } = modal.actions;
export default modal;
