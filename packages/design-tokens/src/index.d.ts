import tokensJson from '../tokens.json';
import motionJson from '../motion.json';
export declare const tokens: {
  color: {
    primary: {
      '50': string;
      '100': string;
      '200': string;
      '300': string;
      '400': string;
      '500': string;
      '600': string;
      '700': string;
      '800': string;
      '900': string;
    };
    secondary: {
      '50': string;
      '100': string;
      '200': string;
      '300': string;
      '400': string;
      '500': string;
      '600': string;
      '700': string;
      '800': string;
      '900': string;
    };
    success: {
      '50': string;
      '100': string;
      '500': string;
      '700': string;
      '900': string;
    };
    warning: {
      '50': string;
      '100': string;
      '500': string;
      '700': string;
      '900': string;
    };
    danger: {
      '50': string;
      '100': string;
      '500': string;
      '700': string;
      '900': string;
    };
    info: {
      '50': string;
      '100': string;
      '500': string;
      '700': string;
      '900': string;
    };
  };
  spacing: {
    '0': string;
    '2': string;
    '4': string;
    '8': string;
    '12': string;
    '16': string;
    '20': string;
    '24': string;
    '32': string;
    '40': string;
    '48': string;
    '64': string;
    '80': string;
  };
  radius: {
    none: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadow: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  zIndex: {
    dropdown: number;
    sticky: number;
    modal: number;
    drawer: number;
    toast: number;
    tooltip: number;
    overlay: number;
  };
};
export declare const semanticTokens: {
  button: {
    primary: {
      background: string;
      text: string;
      hover: string;
    };
    secondary: {
      background: string;
      text: string;
      hover: string;
    };
    danger: {
      background: string;
      text: string;
      hover: string;
    };
  };
  card: {
    background: string;
    border: string;
  };
  input: {
    border: string;
    focusBorder: string;
  };
  navigation: {
    active: string;
    inactive: string;
  };
  exam: {
    correct: string;
    incorrect: string;
    unanswered: string;
  };
};
export declare const motionTokens: {
  duration: {
    hover: string;
    click: string;
    modal: string;
    drawer: string;
    page: string;
    skeleton: string;
  };
  easing: {
    easeInOut: string;
    easeOut: string;
    easeIn: string;
  };
};
export declare const typographyTokens: {
  fontFamily: {
    sans: string;
    mono: string;
  };
  fontSize: {
    displayXl: string;
    displayLg: string;
    headingXl: string;
    headingLg: string;
    headingMd: string;
    headingSm: string;
    bodyLg: string;
    bodyMd: string;
    bodySm: string;
    caption: string;
    label: string;
  };
  fontWeight: {
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
};
export type ColorToken = typeof tokensJson.color;
export type SpacingToken = typeof tokensJson.spacing;
export type RadiusToken = typeof tokensJson.radius;
export type MotionToken = typeof motionJson.duration;
