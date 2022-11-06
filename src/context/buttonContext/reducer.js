export const TYPES = {
  UPDATE_STATE: "UPDATE_STATE",
};
// state of the application
export const initialState = {
  name: "Buy Now",
  path: "/",
};

export default function buttonReducer(state, action) {
  switch (action.type) {
    case TYPES.UPDATE_STATE:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}
