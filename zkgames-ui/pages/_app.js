import { useReducer } from "react";
import Layout from "../components/layout";
import "../styles/globals.css";
import PlausibleProvider from "next-plausible";
import { initialState, reducer } from "../store/reducer";
import { StoreContext } from "../store/useStore";

function MyApp({ Component, pageProps }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <PlausibleProvider domain="zkgames.one">
      <StoreContext.Provider value={{ state, dispatch }}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </StoreContext.Provider>
    </PlausibleProvider>
  );
}

export default MyApp;
