// A cursor "signal" stop dispatches this bubbling CustomEvent on its target
// without moving the pointer, for scripted changes that have no on-screen
// control (the Elections page switching to Results). detail: { name: string }.
export const SIGNAL_EVENT = "wt:signal";

/** The elections scene's signal: the Elections page switches to Results. */
export const ELECTIONS_RESULTS_SIGNAL = "elections-results";
