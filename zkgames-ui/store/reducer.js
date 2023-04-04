import actions from './action';

export const initialState = {
    walletAddress: null,
};

export const reducer = (state, action) => {
    const { type, payload } = action;
    switch (type) {
        case actions.SET_WALLETADDRESS:
            return {
                ...state,
                walletAddress: payload,
            };
        default: {
            return state;
        }
    }
};
