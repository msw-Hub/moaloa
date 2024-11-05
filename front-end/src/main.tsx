import "./style/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <div className="w-full h-screen container-full flex justify-center items-start">
          <App />
        </div>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
