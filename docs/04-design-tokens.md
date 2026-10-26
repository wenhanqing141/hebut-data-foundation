# 设计 Token 规范（第一版）

## 1. 使用原则

- 页面和组件只使用语义 Token，不直接散落十六进制颜色。
- Token 分为基础色、语义色、组件色三层。
- 当前值已同步自用户提供的 Figma Variables 文件，来源文件为数字人速课 Web 端组件库。
- 业务状态不能只依赖颜色，必须同时使用文字、图标或状态标签。
- 颜色、间距、圆角和字体由项目根主题统一维护。

## 2. 基础色 Token

| Token | 临时值 | 用途 |
|---|---:|---|
| `colorBrand` | `#0057ff` | 品牌主色、主要操作 |
| `colorBrandHover` | `rgba(0,87,255,.8)` | 主色悬浮 |
| `colorBrandActive` | `#0057ff` | 主色点击 |
| `colorPageBg` | `#f1f2f5` | 页面背景 |
| `colorSurface` | `#ffffff` | 卡片、表格、弹窗背景 |
| `colorSurfaceSubtle` | `#eaecf2` | 次级面板、表头背景 |
| `colorBorder` | `#d9d9d9` | 默认边框、分割线 |
| `colorBorderStrong` | `#b0b3bd` | 强调边框、输入框聚焦前置状态 |
| `colorText` | `#101114` | 主文字 |
| `colorTextSecondary` | `#525766` | 次文字 |
| `colorTextTertiary` | `#797b80` | 辅助文字 |
| `colorTextDisabled` | `#b0b3bd` | 禁用文字 |

## 3. 状态色 Token

| Token | 临时值 | 用途 |
|---|---:|---|
| `colorSuccess` | `#52c1b4` | 成功、已启用、通过 |
| `colorWarning` | `#ff9900` | 警告、停用前提醒、待处理 |
| `colorError` | `#ea5b41` | 错误、删除、失败、无权限 |
| `colorInfo` | `#00a2ff` | 信息提示、说明 |
| `colorSuccessBg` | `rgba(82,193,180,.12)` | 成功背景 |
| `colorWarningBg` | `rgba(255,153,0,.12)` | 警告背景 |
| `colorErrorBg` | `rgba(234,91,65,.12)` | 错误背景 |
| `colorInfoBg` | `rgba(0,162,255,.12)` | 信息背景 |

## 4. 排版规范

| 层级 | 字号 | 行高 | 用途 |
|---|---:|---:|---|
| 页面标题 | 20px | 28px | 页面主标题 |
| 区块标题 | 16px | 24px | 面板和模块标题 |
| 小标题 | 14px | 22px | 表单组、表格分组 |
| 正文 | 14px | 22px | 默认内容 |
| 辅助文字 | 12px | 20px | 提示、更新时间、说明 |
| 表格正文 | 13px | 20px | 数据密集型表格 |

字体优先级：`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`。

## 5. 间距规范

使用 4px 基础倍数：

```text
space-1   4px    图标与文字的最小间距
space-2   8px    紧凑控件内部间距
space-3   12px   表单项、标签间距
space-4   16px   默认模块间距
space-5   20px   面板内部间距
space-6   24px   区块间距
space-8   32px   页面级大间距
```

## 6. 圆角、阴影和层级

```text
radius-sm  4px   输入框、标签、紧凑按钮
radius-md  6px   卡片、表格、弹窗
radius-lg  8px   仅用于大型浮层或特殊容器
```

默认页面不使用大面积阴影。浮层层级建议：

```text
页面内容      z-index 0
固定头部      z-index 10
下拉/气泡     z-index 1000
抽屉/弹窗     z-index 1100
通知/Toast    z-index 1200
```

## 7. Ant Design 映射原则

- `colorBrand` -> `colorPrimary`。
- `colorSuccess` -> `colorSuccess`。
- `colorWarning` -> `colorWarning`。
- `colorError` -> `colorError`。
- `colorText` -> `colorText`。
- `colorPageBg` -> `colorBgLayout`。
- `colorSurface` -> `colorBgContainer`。
- `colorBorder` -> `colorBorder`。
- `radius-md` -> `borderRadius`。
- 表格、按钮、输入框、菜单的特殊差异放在组件 Token 中，不在页面 CSS 中覆盖。

## 8. 可访问性要求

- 主要文字与背景保持 WCAG AA 可读性目标。
- 禁用态不只降低透明度，必须同时提供明确的不可用状态。
- 红、绿状态必须配合“成功/失败/已启用”等文字。
- 键盘焦点必须有可见轮廓。
- 表格中敏感字段默认脱敏，复制完整值需要明确的操作权限。

