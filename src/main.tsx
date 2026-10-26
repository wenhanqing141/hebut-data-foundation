import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { DEFAULT_ICON_CONFIGS, IconProvider } from "@icon-park/react";
import App from "./App";
import { antdTheme } from "./theme/antd-theme";
import "./theme/tokens.css";
import "./app.css";

const iconConfig = { ...DEFAULT_ICON_CONFIGS, strokeWidth: 4 };

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <ConfigProvider locale={zhCN} theme={antdTheme}>
        <IconProvider value={iconConfig}>
          <App />
        </IconProvider>
      </ConfigProvider>
    </HashRouter>
  </React.StrictMode>,
);
