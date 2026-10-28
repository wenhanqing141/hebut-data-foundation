import { Typography } from "antd";
import { AppShell } from "../layouts/AppShell";
import permissionDeniedIllustration from "../assets/permission-denied-illustration.png";

export function PermissionDeniedPage() {
  return (
    <AppShell title="页面无权限" hideSidebar activeTopKey="permission-denied">
      <main className="permission-denied-page" aria-labelledby="permission-denied-title">
        <img className="permission-denied-illustration" src={permissionDeniedIllustration} alt="" aria-hidden="true" />
        <Typography.Title id="permission-denied-title" level={3} className="permission-denied-title">暂无权限访问</Typography.Title>
      </main>
    </AppShell>
  );
}
