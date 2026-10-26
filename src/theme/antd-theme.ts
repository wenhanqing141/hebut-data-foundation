import type { ThemeConfig } from "antd";

/**
 * Synced from the provided Figma color variables.
 */
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: "#0057ff",
    colorPrimaryHover: "rgba(0, 87, 255, 0.8)",
    colorPrimaryActive: "#0057ff",
    colorSuccess: "#52c1b4",
    colorWarning: "#ff9900",
    colorError: "#ea5b41",
    colorInfo: "#00a2ff",
    colorBgLayout: "#f1f2f5",
    colorBgContainer: "#ffffff",
    colorBgContainerDisabled: "#f1f2f5",
    colorBgTextHover: "#f1f2f5",
    colorBgTextActive: "#e5eeff",
    colorBorder: "#d9d9d9",
    colorBorderSecondary: "#eaecf2",
    colorText: "#101114",
    colorTextSecondary: "#525766",
    colorTextTertiary: "#797b80",
    colorTextDisabled: "#b0b3bd",
    borderRadius: 6,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  components: {
    Table: {
      headerBg: "#eaecf2",
      headerColor: "#101114",
      rowHoverBg: "#f1f2f5",
      cellPaddingBlock: 12,
      cellPaddingInline: 12,
    },
    Button: {
      controlHeight: 32,
      borderRadius: 6,
    },
    Input: {
      controlHeight: 32,
      borderRadius: 6,
    },
    Select: {
      controlHeight: 32,
      borderRadius: 6,
    },
    Modal: {
      borderRadius: 8,
    },
  },
};

