import {
  combineReducers,
  configureStore,
  Action,
  AnyAction,
} from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import chatReducer from "../reducers/chatslice";

const RESET_STATE = "RESET_STATE";

export const resetState = (): Action => ({ type: RESET_STATE });

const rootReducer = (state: any, action: AnyAction) => {
  if (action.type === RESET_STATE) {
    state = undefined;
  }
  return combinedReducers(state, action);
};

const combinedReducers = combineReducers({
  chatState: chatReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["chatState"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
