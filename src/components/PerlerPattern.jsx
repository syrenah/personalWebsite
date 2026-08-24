import {
  PATTERN_PINK,
  PATTERN_YELLOW,
  PATTERN_BLUE,
  PATTERN_GREEN,
  PATTERN_PURPLE,
  PATTERN_SALMON,
  BG_OFFWHITE,
  MUTED_TEXT,
  TILE_BG,
  TILE_BORDER,
} from '../config/contants';

const defaultPattern = [
  '00111100',
  '01111110',
  '11111111',
  '11111111',
  '01111110',
  '00111100',
  '00011000',
  '00011000',
];

const defaultColors = {
  0: 'transparent',
  1: PATTERN_PINK,
  2: PATTERN_YELLOW,
  3: PATTERN_BLUE,
  4: PATTERN_GREEN,
  5: PATTERN_PURPLE,
  6: PATTERN_SALMON,
};

function PerlerPattern({
  pattern = defaultPattern,
  colors = defaultColors,
  cellSize = 18,
  gap = 4,
  background = BG_OFFWHITE,
  title = 'Perler Pattern',
}) {
  const rows = pattern.length;
  const cols = pattern[0]?.length ?? 0;

  if (!rows || !cols) {
    return null;
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 12,
        background,
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: MUTED_TEXT,
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gap: `${gap}px`,
          padding: 8,
          borderRadius: 10,
          background: TILE_BG,
          border: `1px solid ${TILE_BORDER}`,
        }}
      >
        {pattern.flatMap((row, rowIndex) =>
          Array.from(row).map((cell, colIndex) => {
            const value = Number(cell);
            const color = colors[value] ?? colors[0] ?? 'transparent';

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 5,
                  background: color,
                  border: color === 'transparent' ? `1px solid ${TILE_BORDER}` : '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: color !== 'transparent' ? 'inset 0 0 0 1px rgba(255,255,255,0.25)' : 'none',
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default PerlerPattern;
