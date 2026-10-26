import { Breadcrumb, Layout, Menu, Typography } from "antd";
import { ApplicationMenu as AppstoreOutlined } from "@icon-park/react";
import type { MenuProps } from "antd";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

type AppShellProps = {
  title: string;
  breadcrumb?: string[];
  siderWidth?: number;
  sideItems?: MenuProps["items"];
  hideSidebar?: boolean;
  hideSiderHeading?: boolean;
  activeSideKey?: string;
  onSideChange?: (key: string) => void;
  className?: string;
  children: ReactNode;
};

export function AppShell({
  title,
  breadcrumb = [],
  siderWidth = 232,
  sideItems,
  hideSidebar = false,
  hideSiderHeading = false,
  activeSideKey,
  onSideChange,
  className,
  children,
}: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const topKey = location.pathname.startsWith("/access") ? "access" : location.pathname.startsWith("/base/frontend") ? "base-frontend" : "base-admin";
  const goTo = (path: string) => {
    if (window.location.protocol !== "file:") {
      navigate(path);
      return;
    }
    if (path.startsWith("/access")) {
      window.location.href = `接入中心.html${path === "/access/apps" ? "" : `#${path}`}`;
    } else if (path === "/base/frontend") {
      window.location.href = "基础数据中心前台.html";
    } else {
      window.location.href = "基础数据中心后台.html";
    }
  };

  return (
    <Layout className={`app-shell${className ? ` ${className}` : ""}`}>
      <Header className="app-header">
        <div className="brand-block">
          <Typography.Text className="brand-name">河北工业大学</Typography.Text>
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[topKey]}
          className="top-menu"
          items={[
            { key: "base-admin", label: "基础数据中心后台" },
            { key: "base-frontend", label: "基础数据中心前台" },
            { key: "access", label: "接入中心" },
          ]}
          onClick={({ key }) => goTo(key === "access" ? "/access/apps" : key === "base-frontend" ? "/base/frontend" : "/base/admin")}
        />
      </Header>
      <Layout>
        {!hideSidebar && <Sider width={siderWidth} className="app-sider" theme="light">
          {!hideSiderHeading && <div className="sider-heading"><span>{title}</span><AppstoreOutlined /></div>}
          <Menu mode="inline" selectedKeys={activeSideKey ? [activeSideKey] : undefined} items={sideItems} onClick={({ key }) => onSideChange?.(key)} />
        </Sider>}
        <Content className={`app-content ${hideSidebar && breadcrumb.length === 0 ? "admin-content" : ""}`}>
          <div className="content-inner">
            {breadcrumb.length > 0 && <Breadcrumb items={[{ title: "数据基座" }, ...breadcrumb.map((item) => ({ title: item }))]} />}
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
