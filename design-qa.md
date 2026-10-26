# Design QA

source visual truth path: `/private/var/folders/3m/rbqqd38510n75jhx9_wfyrx40000gn/T/codex-clipboard-50e52196-0b0a-4464-945c-9f952bf91722.png`, interpreted together with the latest user-specified overrides.
implementation screenshot: browser-rendered capture from `http://localhost:4174/access/apps` with the interface-detail modal open (captured in the in-app browser; no persistent image file retained).
viewport: implementation `1440 x 900` CSS px, device scale factor `1`; source `2430 x 1236` px.
state: 接入中心 > 注册与授权 > 接口明细.
density normalization: reviewed at desktop 1x visual scale. The reference screenshot uses a wider viewport, so layout was assessed against the modal's content insets, type scale, and table treatment rather than browser chrome.

## Evidence

- Browser capture confirms a `1200 x 600` modal. The table is `1152px` wide inside the dialog, leaving the requested `24px` content inset on both sides.
- The table body's `clientHeight` is `367px`, its `scrollHeight` is `592px`, and `overflow-y` is `auto`; its reusable floating scrollbar remains visible. The table border has a `1px` bottom edge and is not clipped.
- The fixed title is `接口明细`; the management hint sits directly underneath at a `4px` gap. The modal header's lower border resolves to `0px none`.
- The interface table contains 13 realistic records. Multi-method data displays as `GET、POST` in plain secondary-color text.
- Status tags resolve to `14px` text, `2px` rectangular corners, semantic fills, and matching colored borders. `查看` and `修改` use the theme color; `删除` remains a danger action.
- Browser console: no error-level messages. `npm run build` passed.

## Findings

No actionable P0, P1, or P2 differences remain. The reference's application-name suffix, header divider, method chips, and pill-style statuses are intentionally replaced by the latest explicit requirements.

## Required Fidelity Surfaces

- Fonts and typography: title, supporting text, table headers, data cells, and action links use the existing Ant Design admin density; status text is `14px`.
- Spacing and layout rhythm: the table uses the specified 24px horizontal inset and retains visible bottom clearance within the fixed-height dialog.
- Colors and visual tokens: the table header uses `--color-table-header-bg`; action and status colors follow the existing theme and semantic tokens.
- Image quality and asset fidelity: this modal has no visual-image assets. Existing IconPark icons remain in use.
- Copy and content: title and help text exactly follow the latest request; the method separator is `、`.

## Comparison History

1. Earlier versions retained a rounded status tag. Fixed it to the Ant Design-style rectangular `2px` corner treatment.
2. Final browser capture verified the insets, non-clipped table bottom border, fixed-height scrolling, status treatment, and updated copy.

## Implementation Checklist

- [x] Apply the fixed title and 4px supporting-text spacing.
- [x] Remove the modal-header divider.
- [x] Set table content insets to 24px and preserve the table bottom border.
- [x] Use plain gray method text and `GET、POST` for multi-method rows.
- [x] Apply theme links and rectangular, outlined status tags.
- [x] Verify scroll behavior, console output, and production build.

## Latest Interface Editor Verification

- [x] The interface editor reuses the application-detail form labels, sizing, and floating scrollbar container.
- [x] `序号` is disabled and displays `系统自动生成`; create mode generates the API code on save.
- [x] `调用方式` is a checkbox group limited to `GET` and `POST`, with only `GET` selected by default.
- [x] `状态` is a radio group with `启用` selected by default.
- [x] Optional `接口文档` textarea is present and included in the saved interface record.
- [x] Browser verification at `http://localhost:4173/base/admin` showed the requested state; `npm run build` passed after the change.

## Latest Interface Detail Verification

source visual truth path: `/private/var/folders/3m/rbqqd38510n75jhx9_wfyrx40000gn/T/codex-clipboard-81de5f46-acf5-4a4e-bd7b-e04027eaafc1.png`.
implementation screenshot: browser-rendered capture from `http://localhost:4173/access/apps` with the interface-detail modal open.
viewport: implementation `1280 x 720` CSS px; source `2404 x 1204` px, normalized by comparing the modal table's desktop layout and visible controls rather than browser chrome.
state: 接入中心 > 注册与授权 > 接口明细.

**Findings**

No actionable P0, P1, or P2 differences remain for this requested update.

**Evidence**

- The implementation table headers are `序号、接口名称、调用方式、接口地址、状态、操作`; the standalone `接口文档` column is absent.
- The first row's operation order is `查看接口文档、修改、删除`, and the same order is rendered for every visible row.
- The table colgroup resolves the interface-address column to `400px`; table minimum width and horizontal-scroll width resolve to `1160px`.
- Focused review of the table body confirms the longer address field remains legible before ellipsis, the action links stay on one row, and status/tag colors remain unchanged.
- There are no added image assets in this UI; existing IconPark and Ant Design visual treatments are preserved. Copy, labels, tokens, typography, table spacing, and border treatment match the existing dialog.

**Implementation Checklist**

- [x] Remove the standalone interface-document table column.
- [x] Add `查看接口文档` as the first operation action.
- [x] Set the interface-address column width to `400px` and adjust the table width.
- [x] Validate in the browser and run `npm run build`.

## Latest Data Permission Verification

source visual truth path: `/private/var/folders/3m/rbqqd38510n75jhx9_wfyrx40000gn/T/codex-clipboard-8f8a8ef1-37f5-4d7d-b00f-9d8d1a7a7187.png`.
implementation screenshot: browser-rendered capture from `http://localhost:4173/access/apps` with the 配置数据权限 modal open and the 删除 permission expanded.
state: 接入中心 > 注册与授权 > 配置数据权限 > 基础数据表 > 删除 > 数据过滤条件.

**Findings**

No actionable P0, P1, or P2 differences remain for the requested adjustments.

**Evidence**

- The sidebar list, category rows, and table-item rows resolve to `259px` wide and `40px` high.
- Expanded configuration titles resolve to `14px / 22px`; helper copy resolves to `12px / 20px` with a `4px` title-to-copy gap.
- The collapse control retains a `16px` list inset (rendered `17px` including the container border); 添加条件 uses `var(--color-brand)`.
- After adding a condition, both condition selectors render IconPark's `Down` glyph as their suffix icon.
- Typography, spacing, semantic colors, copy, and existing visual assets remain aligned with the application design system. No image assets were added or changed.

**Implementation Checklist**

- [x] Set the sidebar menu geometry.
- [x] Normalize expanded-section title and helper-copy typography.
- [x] Apply the themed add-condition link and right-side spacing.
- [x] Use IconPark suffix icons for added-condition selects.
- [x] Verify the expanded state in the browser and run a production build.

final result: passed
