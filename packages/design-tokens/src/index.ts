import tokensJson from '../tokens.json';
import semanticTokensJson from '../semantic-tokens.json';
import motionJson from '../motion.json';
import typographyJson from '../typography.json';

export const tokens = tokensJson;
export const semanticTokens = semanticTokensJson;
export const motionTokens = motionJson;
export const typographyTokens = typographyJson;

export type ColorToken = typeof tokensJson.color;
export type SpacingToken = typeof tokensJson.spacing;
export type RadiusToken = typeof tokensJson.radius;
export type MotionToken = typeof motionJson.duration;
