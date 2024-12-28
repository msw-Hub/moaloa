import "./style/index.css";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.ts";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <BrowserRouter>
    <Provider store={store}>
      <div className="transition-all bg-light text-bgdark dark:bg-bgdark dark:text-light">
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </div>
    </Provider>
  </BrowserRouter>
  // </StrictMode>
);
