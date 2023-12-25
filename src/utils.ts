import { HoldemStateType } from './state.js';

import { Console } from 'console';
import { Transform } from 'node:stream';
import { isPlayerAction } from './action.js';

const ts = new Transform({
	transform(chunk, _, cb) {
		cb(null, chunk);
	},
});
const logger = new Console({ stdout: ts });

function getTable(data: any) {
	logger.table(data);
	const table = (ts.read() || '').toString();
	console.log(table);
}
console.table = getTable;

export const isNumber = (value: any): value is number => {
	return typeof value === 'number';
};

export const printTable = (state: HoldemStateType) => {
	let seats: string[] = [];
	let printActions: { [index: string]: string }[] = [];
	for (let i = 0; i < state.seats.length; i++) {
		seats.push(i + '');
	}
	for (let i = 0; i < state.actionList.length; i++) {
		let blankAction: { [index: string]: string } = {};

		const action = state.actionList[i];
		if (isPlayerAction(action)) {
			blankAction[action.seat] = action.action;
			if ('amount' in action)
				blankAction[action.seat] =
					blankAction[action.seat] + '(' + action.amount + ')';
		} else {
			for (let i = 0; i < state.seats.length; i++)
				blankAction[i + ''] = `${action.action}`;
		}
		printActions.push(blankAction);
	}
	console.table(printActions);
};
