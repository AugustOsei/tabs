// Hero scene configuration.
// `board` is the blank board's inner rectangle as percentages of the image.
// Fine-tune with ?debug=board (arrow keys move, Shift+arrows resize), then
// paste the values shown in the readout back here.

export type BoardRect = { x: number; y: number; w: number; h: number };

export type HeroVariant = {
  /** Base path of the optimised image, without width or extension. */
  image: string;
  widths: [number, number];
  /** Image aspect ratio (width / height). */
  aspect: number;
  /** `sizes` attribute for the responsive image. */
  sizes: string;
  board: BoardRect;
  /** 0 pins the image to the top when it is cropped vertically, 0.5 centres it. */
  verticalBias: number;
  /** Share of the board (0 to 1) the logo occupies. */
  logoFit: number;
};

/** Viewports narrower than this aspect ratio get the portrait scene. */
export const MOBILE_QUERY = "(max-aspect-ratio: 4/5)";

export const hero = {
  desktop: {
    image: "/assets/hero-desktop",
    widths: [1344, 2688],
    aspect: 1344 / 752,
    sizes: "100vw",
    board: { x: 31.1, y: 13.03, w: 37.13, h: 30.98 },
    verticalBias: 0.3,
    logoFit: 0.8,
  },
  mobile: {
    image: "/assets/hero-mobile",
    widths: [752, 1504],
    aspect: 752 / 1344,
    sizes: "115vw",
    board: { x: 13.3, y: 13.17, w: 70.88, h: 22.47 },
    verticalBias: 0.25,
    logoFit: 0.84,
  },
} satisfies Record<"desktop" | "mobile", HeroVariant>;

/** Scroll length of the pinned sequence, in viewport heights. */
export const SCROLL_VIEWPORTS = 3.4;

/** Timeline stops as scroll progress (0 to 1). */
export const stops = {
  settleEnd: 0.1,
  glideStart: 0.1,
  glideEnd: 0.32,
  clickStart: 0.32,
  clickEnd: 0.37,
  zoomStart: 0.37,
  zoomEnd: 0.6,
  /** Poster beat: the title and the full figure appear. */
  titleStart: 0.6,
  /** Details beat: the figure slides right and the copy forms. */
  detailStart: 0.78,
} as const;

/** Arrow cursor path as a cubic bezier, in logo viewBox units (506 x 296). */
export const cursorPath = {
  from: { x: 452, y: 304 },
  c1: { x: 478, y: 130 },
  c2: { x: 230, y: 160 },
  to: { x: 96, y: 34 },
} as const;
