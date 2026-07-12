/**
 * @service UI
 * Global theme tokens and styles
 */

export const themeTokens = {
  colors: {
    primary: '#1e3a8a', // curated sleek dark blue
    secondary: '#3b82f6', // harmonious blue
    background: '#0f172a', // sleek dark mode background
    card: '#1e293b', // slate card
    text: '#f8fafc', // white-ish text
    error: '#ef4444', // refined red
  },
  typography: {
    fontFamily: 'Outfit, Inter, sans-serif',
  },
};

export const globalStyles = `
  body {
    background-color: ${themeTokens.colors.background};
    color: ${themeTokens.colors.text};
    font-family: ${themeTokens.typography.fontFamily};
    margin: 0;
    padding: 0;
  }
`;
