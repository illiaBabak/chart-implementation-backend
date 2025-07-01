const RADIUS = 80;
const STROKE_WIDTH = 40;
const CX = 125;
const CY = 125;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const generateSVGChart = (
  data: {
    percentage: number;
    color: string;
  }[]
): string => {
  let offset = 0;

  const circles = data.map((segment) => {
    const dash = (segment.percentage / 100) * CIRCUMFERENCE;
    const dashOffset = offset;
    offset += dash;

    return `
      <circle
        cx="${CX}"
        cy="${CY}"
        r="${RADIUS}"
        fill="none"
        stroke="${segment.color}"
        stroke-width="${STROKE_WIDTH}"
        stroke-dasharray="${dash} ${CIRCUMFERENCE - dash}"
        stroke-dashoffset="${-dashOffset}"
        transform="rotate(-90, ${CX}, ${CY})"
      />
    `;
  });

  return `
    <svg width="250" height="250">
      ${circles.join("\n")}
    </svg>
  `;
};
