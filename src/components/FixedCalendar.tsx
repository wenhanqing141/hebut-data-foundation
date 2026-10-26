import { IconWrapper } from "@icon-park/react/es/runtime";

// IconPark's Calendar draws the header divider twice. Keep its geometry but draw that divider once.
export const FixedCalendar = IconWrapper("calendar", false, (props) => (
  <svg width={props.size} height={props.size} viewBox="0 0 48 48" fill="none">
    <path d="M5 19H43V40C43 41.1046 42.1046 42 41 42H7C5.89543 42 5 41.1046 5 40V19Z" fill={props.colors[1]} stroke={props.colors[0]} strokeWidth={props.strokeWidth} strokeLinejoin={props.strokeLinejoin} />
    <path d="M5 19V9C5 7.89543 5.89543 7 7 7H41C42.1046 7 43 7.89543 43 9V19" stroke={props.colors[0]} strokeWidth={props.strokeWidth} strokeLinejoin={props.strokeLinejoin} />
    <path d="M16 4V12M32 4V12M28 34H34M14 34H20M28 26H34M14 26H20" stroke={props.colors[0]} strokeWidth={props.strokeWidth} strokeLinecap={props.strokeLinecap} strokeLinejoin={props.strokeLinejoin} />
  </svg>
));
