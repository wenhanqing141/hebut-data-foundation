import React, { type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { antdTheme } from "../theme/antd-theme";
import "../theme/tokens.css";
import "../app.css";

export function renderStandalone(page: ReactNode) {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <HashRouter>
        <ConfigProvider locale={zhCN} theme={antdTheme}>
          <Routes>
            <Route path="*" element={page} />
          </Routes>
        </ConfigProvider>
      </HashRouter>
    </React.StrictMode>,
  );
}
