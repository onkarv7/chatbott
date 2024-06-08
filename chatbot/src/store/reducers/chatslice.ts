import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  text: string;
  sender: "user" | "bot";
  typewriter?: boolean;
  timestamp?: string;
}

interface ChatState {
  messages: Message[];
}

const initialState: ChatState = {
  messages: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    updateMessage(
      state,
      action: PayloadAction<{ index: number; message: Message }>
    ) {
      const { index, message } = action.payload;
      state.messages[index] = message;
    },
  },
});

export const { addMessage, updateMessage } = chatSlice.actions;
export default chatSlice.reducer;
