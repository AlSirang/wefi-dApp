import React, { createContext, useContext, useReducer } from "react";
import actions from "./web3Context/actions";
import reducer, { initialState } from "./web3Context/reducer";

import buttonActions from "./buttonContext/actions";
import buttonReducer, {
  initialState as buttonInitialState,
} from "./buttonContext/reducer";

const Web3Context = createContext({});
const ButtonContext = createContext({});

export const Web3ContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <Web3Context.Provider value={{ ...actions(state, dispatch) }}>
      {children}
    </Web3Context.Provider>
  );
};

export const Web3UserContext = () => useContext(Web3Context);

export const ButtonContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(buttonReducer, buttonInitialState);

  return (
    <ButtonContext.Provider value={{ ...buttonActions(state, dispatch) }}>
      {children}
    </ButtonContext.Provider>
  );
};

export const ButtonUserContext = () => useContext(ButtonContext);
