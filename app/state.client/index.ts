import { create, StateCreator } from "zustand";
import { PraxSlice, createPraxSlice } from "./prax";

// When you create a new slice, add its type here
export type AllSlices = {
  prax: PraxSlice;
};

export type SliceCreator<T> = StateCreator<AllSlices, [], [], T>;

// Create new slices here
export const useStore = create<AllSlices>()((...a) => ({
  prax: createPraxSlice(...a),
}));

// loaders (server) *public data
//  or react-query (client) *prax data
// === Server state ==
// proposals
// voting tallys

// zustand
// === Client state ==
// prax clients <-- connect(), client var
// form inputs
// logic for taking actions on this state

// zustand: business logic
// components: display data

// === Voting power for proposal
// loaders retrieve public data (useLoader())
// const isPraxConnect() -> zustand, if not render <Placeholder>
//   - easy way -> redirect to connect page
//   - hard way -> better UX, but write the non-connected version of the page
// Are connected case:
//   react-query for -> client.allMyVotingNotes()
//   After action, call react-query.invalidate()
// Form:
//    react-query may have to pass data to zustand
//    Zustand collects the form input & initiates action
