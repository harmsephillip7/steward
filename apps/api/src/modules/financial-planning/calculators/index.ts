/**
 * Public surface for all FNA calculators. The intent is that the API
 * controllers pass typed payloads to these pure functions, the FNA report
 * template renders them, and the same outputs feed the dashboard widgets.
 */
export * from './retirement';
export * from './insurance';
export * from './estate';
export * from './education';
export * from './tfsa';
export * from './reg28';
export * from './living-annuity';
