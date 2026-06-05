// ─────────────────────────────────────────────────────────────
// アイコンセット（react-native-svg）
//
// design_reference/app/app-components.jsx の Icon を移植し、タイムライン用
// （pin/dot/cup/star）と操作用（trash/copy/archive）を追加しています。
// 線は currentColor の代わりに color プロップで指定します（RN の流儀）。
// ─────────────────────────────────────────────────────────────
import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'bell'
  | 'chevron'
  | 'back'
  | 'plus'
  | 'check'
  | 'close'
  | 'home'
  | 'gear'
  | 'bed'
  | 'train'
  | 'moon'
  | 'clock'
  | 'edit'
  | 'pin'
  | 'dot'
  | 'cup'
  | 'star'
  | 'trash'
  | 'copy'
  | 'archive'
  | 'unarchive';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 18, color = '#000', strokeWidth = 1.7 }: IconProps) {
  const stroke = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  const glyphs: Record<IconName, React.ReactNode> = {
    bell: (
      <>
        <Path
          d="M5.5 9a4.5 4.5 0 019 0c0 3.5 1.2 4.8 1.7 5.3a.5.5 0 01-.35.86H4.15a.5.5 0 01-.35-.86C4.3 13.8 5.5 12.5 5.5 9z"
          {...stroke}
        />
        <Path d="M8.4 17.4a1.8 1.8 0 003.2 0" {...stroke} />
      </>
    ),
    chevron: <Path d="M7.5 4.5l5 5.5-5 5.5" {...stroke} />,
    back: <Path d="M12.5 4.5l-5 5.5 5 5.5" {...stroke} />,
    plus: <Path d="M10 4.5v11M4.5 10h11" {...stroke} />,
    check: <Path d="M4.5 10.5l3.5 3.5 7-8" {...stroke} />,
    close: <Path d="M5 5l10 10M15 5L5 15" {...stroke} />,
    home: (
      <>
        <Path d="M4 9l6-5 6 5" {...stroke} />
        <Path d="M5.5 8v7.5h9V8" {...stroke} />
      </>
    ),
    gear: (
      <>
        <Circle cx={10} cy={10} r={2.6} {...stroke} />
        <Path
          d="M10 3.2v1.8M10 15v1.8M3.2 10H5M15 10h1.8M5.2 5.2l1.3 1.3M13.5 13.5l1.3 1.3M14.8 5.2l-1.3 1.3M6.5 13.5l-1.3 1.3"
          {...stroke}
        />
      </>
    ),
    bed: (
      <>
        <Path d="M3.5 6.5v8M3.5 11h13v3.5M16.5 11V9a2 2 0 00-2-2H8.5v4" {...stroke} />
        <Circle cx={6} cy={9.2} r={1.2} {...stroke} />
      </>
    ),
    train: (
      <>
        <Rect x={5.5} y={3.5} width={9} height={10} rx={2} {...stroke} />
        <Path d="M5.5 9h9" {...stroke} />
        <Path d="M7 16.5l1.5-2M13 16.5l-1.5-2" {...stroke} />
      </>
    ),
    moon: <Path d="M15.5 11.2A6 6 0 118.8 4.5a4.7 4.7 0 006.7 6.7z" {...stroke} />,
    clock: (
      <>
        <Circle cx={10} cy={10} r={6.3} {...stroke} />
        <Path d="M10 6.5V10l2.5 1.6" {...stroke} />
      </>
    ),
    edit: <Path d="M12.5 4.8l2.7 2.7M4.5 12.8l8-8 2.7 2.7-8 8H4.5z" {...stroke} />,
    pin: (
      <>
        <Path d="M10 2.5c-3 0-5.2 2.2-5.2 5 0 3.6 5.2 9.5 5.2 9.5s5.2-5.9 5.2-9.5c0-2.8-2.2-5-5.2-5z" {...stroke} />
        <Circle cx={10} cy={7.6} r={1.9} {...stroke} />
      </>
    ),
    dot: <Circle cx={10} cy={10} r={2.6} fill={color} stroke="none" />,
    cup: (
      <>
        <Path d="M5 7.5h7.5v3.5a3.75 3.75 0 01-7.5 0z" {...stroke} />
        <Path d="M12.5 8.5h1.8a1.6 1.6 0 010 3.2h-1.8" {...stroke} />
        <Path d="M5 15.5h7.5" {...stroke} />
      </>
    ),
    star: (
      <Path
        d="M10 3l2.1 4.3 4.7.6-3.4 3.3.8 4.7L10 13.6 5.8 15.9l.8-4.7L3.2 7.9l4.7-.6z"
        {...stroke}
      />
    ),
    trash: (
      <>
        <Path d="M4.5 6h11" {...stroke} />
        <Path d="M8 6V4.5h4V6" {...stroke} />
        <Path d="M6.2 6l.7 9.5h6.2l.7-9.5" {...stroke} />
      </>
    ),
    copy: (
      <>
        <Rect x={7} y={7} width={9} height={9} rx={2} {...stroke} />
        <Path d="M12.5 7V5.5a1.5 1.5 0 00-1.5-1.5H5.5A1.5 1.5 0 004 5.5V11a1.5 1.5 0 001.5 1.5H7" {...stroke} />
      </>
    ),
    archive: (
      <>
        <Rect x={3.5} y={4.5} width={13} height={3.5} rx={1} {...stroke} />
        <Path d="M5 8v7h10V8" {...stroke} />
        <Path d="M8 11h4" {...stroke} />
      </>
    ),
    unarchive: (
      <>
        <Rect x={3.5} y={4.5} width={13} height={3.5} rx={1} {...stroke} />
        <Path d="M5 8v7h10V8" {...stroke} />
        <Path d="M10 14.5V9.5M8 11l2-2 2 2" {...stroke} />
      </>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      {glyphs[name]}
    </Svg>
  );
}
