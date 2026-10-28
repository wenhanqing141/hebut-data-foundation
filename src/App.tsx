import { Navigate, Route, Routes } from "react-router-dom";
import { BaseDataAdminPage } from "./pages/BaseDataAdminPage";
import { BaseDataFrontendPage } from "./pages/BaseDataFrontendPage";
import { AccessCenterPage } from "./pages/AccessCenterPage";
import { PermissionDeniedPage } from "./pages/PermissionDeniedPage";

export default function App() {
  return (
    <Routes>
      <Route path="/base/admin" element={<BaseDataAdminPage />} />
      <Route path="/base/frontend" element={<BaseDataFrontendPage />} />
      <Route path="/access/*" element={<AccessCenterPage />} />
      <Route path="/permission-denied" element={<PermissionDeniedPage />} />
      <Route path="*" element={<Navigate to="/base/admin" replace />} />
    </Routes>
  );
}
