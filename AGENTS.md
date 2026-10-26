# Project UI Rules

- Use IconPark (`@icon-park/react`) for every UI icon in this project, including new work and replacements of existing icons.
- Do not add new icons from `@ant-design/icons`; when touching an existing icon, migrate it to the semantically closest IconPark icon.
- Keep Ant Design components for component structure and interaction, but use IconPark for their `icon` props.
- Whenever text is visually truncated with ellipsis, hovering it must show the complete text in an Ant Design `Tooltip`. Reuse `src/components/OverflowTooltip.tsx` so the tooltip is only enabled when the rendered text actually overflows.
- Use `--color-table-header-bg` for every table-like header background, including modal sorting lists; do not introduce separate header background colors.
