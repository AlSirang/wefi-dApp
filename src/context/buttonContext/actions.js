import { TYPES } from "./reducer";

export default function actions(state, dispatch = () => {}) {
  const updateButton = (payload) => {
    dispatch({
      type: TYPES.UPDATE_STATE,
      payload,
    });
  };
  return {
    // custom actions
    updateButton,

    // navtie state and dispatch
    contextState: state,
  };
}
