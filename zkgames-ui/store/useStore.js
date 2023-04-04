import { createContext, useContext } from 'react';

export const StoreContext = createContext(null);

const useStore = () => useContext(StoreContext);

export default useStore;
