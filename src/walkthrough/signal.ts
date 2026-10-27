// A cursor "signal" stop dispatches this bubbling CustomEvent on its target
// without moving the pointer, for scripted changes that have no on-screen
// control (the Elections page switching to Results). detail: { name: string }.
export const SIGNAL_EVENT = "wt:signal";

/** The elections scene's signal: the Elections page switches to Results. */
export const ELECTIONS_RESULTS_SIGNAL = "elections-results";

/** The elections scene's Home click: the portal switches to the board member view. */
export const BOARD_VIEW_SIGNAL = "board-view";

/** The board-review scene's first stop: the Board Actions widget starts over (item 1, nothing decided, no sheet). */
export const BOARD_REVIEW_RESET_SIGNAL = "board-review-reset";
