export * from './roles.js';
export * from './permissions.js';
export * from './workflows.js';
// Generated from the API's OpenAPI document (pnpm api:types); never edit api-types.ts by hand. The document describes
// requests (bodies, parameters, queries) exactly; responses are not described yet, so response shapes live with
// their consumers (apps/web/src/lib/api-shapes.ts).
export type { components, operations, paths } from './api-types.js';
import type { components } from './api-types.js';
/** A request body as the API validates it: `ApiBody<'CreateProjectDto'>`. */
export type ApiBody<K extends keyof components['schemas']> = components['schemas'][K];
