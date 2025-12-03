import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@cloudscape-design/global-styles/index.css";

document.body.classList.add("awsui-dark-mode");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
