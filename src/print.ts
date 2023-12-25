import { HoldemStateType } from './state.js';

export const basicPrintStateTable = (state: HoldemStateType) => {
	console.table(state.actions);
};
