// Gold arrow cursor and click ripple, drawn in the logo's viewBox so they stay
// locked to the logo at every size. The arrow's tip is its local origin.
export default function ArrowCursor() {
  return (
    <>
      <circle className="hero-ripple" cx="96" cy="34" r="0" fill="none" stroke="#F5C518" strokeWidth="3" opacity="0" />
      <g className="hero-arrow" aria-hidden="true">
        <path
          className="hero-arrow-shape"
          d="M0 0 L0 40 L10.5 30.5 L17.5 47 L25 43.8 L18 27.5 L32 27.5 Z"
          fill="#F5C518"
          stroke="#0D1B2A"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
    </>
  );
}
