// A cursor "drop" stop dispatches this bubbling CustomEvent on its target when
// it lets go of the file card it carried in; drop zones (the Ask HOAi input)
// listen for it. detail: { name: string }.
export const DROP_FILE_EVENT = "wt:drop-file";
