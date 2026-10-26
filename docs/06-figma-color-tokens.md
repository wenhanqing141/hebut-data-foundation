# Figma 颜色变量提取记录

来源：用户提供的 Figma 文件《数字人-速课_组件库_Web端（温汉清）》Variables，节点 `798:1948`。

提取结果：83 个 `COLOR` 类型变量。变量中存在大量语义别名，因此项目代码按“基础色 + 语义色”两层落地，避免重复维护同一个颜色。

## 基础色

| Figma 变量 | HEX/RGBA |
|---|---|
| `基础色/brand/1` | `#0057ff` |
| `基础色/brand/2` | `rgba(0,87,255,.8)` |
| `基础色/brand/3` | `rgba(0,87,255,.4)` |
| `基础色/brand/4` | `#e5eeff` |
| `基础色/brand/5` | `rgba(0,87,255,.05)` |
| `基础色/auxiliary/1` | `#0d1839` |
| `基础色/auxiliary/2` | `#3d4766` |
| `基础色/auxiliary/3` | `#7d8ab2` |
| `基础色/gray/1` | `#101114` |
| `基础色/gray/2` | `#525766` |
| `基础色/gray/3` | `#797b80` |
| `基础色/gray/4` | `#b0b3bd` |
| `基础色/gray/5` | `#d9d9d9` |
| `基础色/gray/6` | `#eaecf2` |
| `基础色/gray/7` | `#f1f2f5` |
| `基础色/status/success` | `#52c1b4` |
| `基础色/status/error` | `#ea5b41` |
| `基础色/status/warning` | `#ff9900` |
| `基础色/status/caution` | `#ffd600` |
| `基础色/status/info` | `#00a2ff` |
| `基础色/status/accent` | `#903da8` |
| `基础色/common/white` | `#ffffff` |
| `基础色/common/black` | `#000000` |
| `基础色/common/mask` | `rgba(0,0,0,.6)` |

## 语义映射

| Figma 语义变量 | 项目 Token |
|---|---|
| `基础颜色拓展/brand/brand-color` | `--color-brand` |
| `基础颜色拓展/brand/brand-color-hover` | `--color-brand-hover` |
| `基础颜色拓展/brand/brand-color-disabled` | `--color-brand-disabled` |
| `基础颜色拓展/brand/brand-color-light-hover` | `--color-brand-light-hover` |
| `基础颜色拓展/brand/brand-color-light` | `--color-brand-light` |
| `基础颜色拓展/brand/brand-color-focus` | `--color-brand-focus` |
| `文本颜色/*` | `--color-text-*` |
| `图标颜色/*` | `--color-icon-*` |
| `背景色/*` | `--color-*` 对应背景 Token |
| `边框/*` | `--color-border-*` |
| `基础颜色拓展/success/*` | `--color-success` |
| `基础颜色拓展/error/*` | `--color-error` |
| `基础颜色拓展/warning/*` | `--color-warning` |
| `基础颜色拓展/caution/*` | `--color-caution` |
| `基础颜色拓展/info/*` | `--color-info` |
| `基础颜色拓展/accent/*` | `--color-accent` |
| `遮罩/mask-active` | `--color-mask-active` |

投影颜色也已读取，但暂不进入 Ant Design 主色映射：`#0000001a`、`#00000026`、`rgba(0,87,255,.2)`。

