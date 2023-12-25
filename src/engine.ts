import { z } from 'zod';
import { PlayerActionsType, isDealerAction, isPlayerAction } from './action.js';
import { HoldemStateType, PokerRoundsType } from './state.js';
import { preBuiltTestHandOne } from './testHands.js';

import { isNumber, printTable } from './utils.js';

export type BetOptionType = {
	option: 'bet';
	range: {
		min: number;
		max: number;
	};
};

export type CallOptionType = {
	option: 'call';
	amount: number;
};

export type CheckOptionType = {
	option: 'check';
};

export type FoldOptionType = {
	option: 'fold';
};

export type OptionType =
	| BetOptionType
	| CallOptionType
	| CheckOptionType
	| FoldOptionType;

export type NextType = {
	seat: number;
	options: OptionType[];
};

// export const next = (state: HoldemStateType): NextType => {};

export const seatNext = (state: HoldemStateType): number => {
	return 0;
};

export const hasSeatActedThisRound = (
	seat: number,
	state: HoldemStateType,
): boolean => {
	if (state.seats.length < seat) throw new Error(`hasSeatActedThisRound() - `);

	return false;
};

export const whatRoundAtActionIndex = (state: HoldemStateType, idx: number) => {
	if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;
	let latest: PokerRoundsType = 'preflop';
	for (let i = 0; i <= idx; i++) {
		let currAction = state.actionList[i];
		if (isDealerAction(currAction)) {
			latest = currAction.action;
		}
	}
	return latest;
};

export const whatRound = (state: HoldemStateType): PokerRoundsType => {
	return whatRoundAtActionIndex(state, state.actionList.length - 1);
};

export const playerActionsBySeat = (state: HoldemStateType) => {
	const m = new Map<number, PlayerActionsType[]>();
	for (let i = 0; i < state.seats.length; i++) m.set(i, []);
	for (let a of state.actionList) {
		if (isPlayerAction(a)) {
			let newList = m.get(a.seat);
			if (newList === undefined) newList = [a];
			else newList.push(a);
			m.set(a.seat, newList);
		}
	}
	return m;
};

export type StackBetPerRoundType = { [index: string]: number[] };
export type StackRemainingPerRoundType = {
	[index: string]: (number | 'unk')[];
};

export const blankStackBetPerRound = (
	numberSeats: number,
): StackBetPerRoundType => {
	const zeroArray = new Array(numberSeats).fill(0);
	return {
		preflop: [...zeroArray],
		flop: [...zeroArray],
		turn: [...zeroArray],
		river: [...zeroArray],
	};
};

export const stackBetPerRoundAtIndex = (
	state: HoldemStateType,
	idx: number,
) => {
	if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;
	let running = blankStackBetPerRound(state.seats.length);
	for (let i = 0; i <= idx; i++) {
		const currAction = state.actionList[i];
		if (isDealerAction(currAction)) continue;
		if (currAction.action === 'fold' || currAction.action === 'check') continue;
		// !TODO Handle Antes
		let round = whatRoundAtActionIndex(state, i);
		running[round][currAction.seat] = currAction.amount;
	}
	return running;
};
export const stackBetPerRound = (state: HoldemStateType) => {
	return stackBetPerRoundAtIndex(state, state.actionList.length - 1);
};

export const totalBetsPerSeatAtIndex = (
	state: HoldemStateType,
	idx: number,
): number[] => {
	if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;

	const betsPerRound = stackBetPerRoundAtIndex(state, idx);
	let bets = new Array(state.seats.length).fill(0);
	for (let round in betsPerRound) {
		betsPerRound[round].forEach((value, seat) => {
			bets[seat] += value;
		});
	}
	return bets;
};

export const totalBetsPerSeat = (state: HoldemStateType) => {
	return totalBetsPerSeatAtIndex(state, state.actionList.length - 1);
};

export const stackRemainingAtIndex = (
	state: HoldemStateType,
	idx: number,
): (number | 'unk')[] => {
	if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;
	const bps = totalBetsPerSeatAtIndex(state, idx);
	let stacks = new Array(state.seats.length).fill(0);
	for (let i = 0; i < stacks.length; i++) {
		let stack: number | 'unk' = state.seats[i].startingStack;
		if (isNumber(stack)) stacks[i] = stack - bps[i];
		else stacks[i] = 'unk';
	}
	return stacks;
};

export const stackRemaining = (state: HoldemStateType) => {
	return stackRemainingAtIndex(state, state.actionList.length - 1);
};

export const bettableStackRemainingAtIndex = (
	state: HoldemStateType,
	idx: number,
) => {
	if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;
	const sbpr = stackBetPerRoundAtIndex(state, idx);
	const currRound = whatRound(state);
	let stacks: StackRemainingPerRoundType = blankStackBetPerRound(
		state.seats.length,
	);
	for (let i = 0; i < state.seats.length; i++) {
		const startingStack = state.seats[i].startingStack;
		if (!isNumber(startingStack)) {
			stacks['preflop'][i] = 'unk';
			stacks['flop'][i] = 'unk';
			stacks['turn'][i] = 'unk';
			stacks['river'][i] = 'unk';
		} else {
			stacks['preflop'][i] = startingStack;
			stacks['flop'][i] = startingStack - sbpr['preflop'][i];
			stacks['turn'][i] = startingStack - sbpr['preflop'][i] - sbpr['flop'][i];
			stacks['river'][i] =
				startingStack - sbpr['preflop'][i] - sbpr['flop'][i] - sbpr['turn'][i];
		}
	}

	return stacks;
};

export const bettableStackRemaining = (state: HoldemStateType) => {
	return bettableStackRemainingAtIndex(state, state.actionList.length - 1);
};

export type ActionsByRoundType = {
	[index: string]: PlayerActionsType[];
};

export const blankActionsByRound = (numberSeats: number) => {
	const zeroArray = new Array<PlayerActionsType>(numberSeats);
	return {
		preflop: new Array<PlayerActionsType>(),
		flop: new Array<PlayerActionsType>(),
		turn: new Array<PlayerActionsType>(),
		river: new Array<PlayerActionsType>(),
	};
};

export const actionsByRoundAtIndex = (
	state: HoldemStateType,
	idx: number,
): ActionsByRoundType => {
	let actions = blankActionsByRound(state.seats.length);
	if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;
	let currRound = 'preflop';
	for (let i = 0; i <= idx; i++) {
		const act = state.actionList[i];
		if (isPlayerAction(act)) {
			if (
				currRound === 'preflop' ||
				currRound === 'flop' ||
				currRound === 'turn' ||
				currRound === 'river'
			)
				actions[currRound].push(act);
		} else {
			currRound = act.action;
		}
	}
	return actions;
};

export const actionsByRound = (state: HoldemStateType) => {
	return actionsByRoundAtIndex(state, state.actionList.length - 1);
};

export const seatsFoldedAtIndex = (
	state: HoldemStateType,
	idx: number,
): boolean[] => {
	if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;
	let folded: boolean[] = new Array<boolean>(state.seats.length).fill(false);
	state.actionList.slice(0, idx).forEach((value) => {
		if (value.action === 'fold') folded[value.seat] = true;
	});
	return folded;
};

export const seatsFolded = (state: HoldemStateType) => {
	return seatsFoldedAtIndex(state, state.actionList.length - 1);
};

export const seatsAllinAtIndex = (
	state: HoldemStateType,
	idx: number,
): boolean[] => {
	if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;
	let allin: boolean[] = new Array<boolean>(state.seats.length).fill(false);
	state.actionList.slice(0, idx).forEach((value) => {
		if ('isAllIn' in value && value.isAllIn) allin[value.seat] = true;
	});
	return allin;
};

export const seatsAllin = (state: HoldemStateType) => {
	return seatsAllinAtIndex(state, state.actionList.length - 1);
};

export const nextSeatActionAtIndex = (
	state: HoldemStateType,
	idx: number,
): number => {
	if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;

	let eligible = new Array(state.seats.length).fill(true);

	//everyone that has folded
	const seatsFolded = seatsFoldedAtIndex(state, idx);
	seatsFolded.forEach((value, index) => {
		if (value) eligible[index] = false;
	});

	//everyone that is already all in
	const seatsAllin = seatsAllinAtIndex(state, idx);
	seatsAllin.forEach((value, index) => {
		if (value) eligible[index] = false;
	});

	console.table(eligible);

	return 0;
};

export const nextSeatAction = (state: HoldemStateType) => {
	return nextSeatActionAtIndex(state, state.actionList.length - 1);
};

printTable(preBuiltTestHandOne);
nextSeatAction(preBuiltTestHandOne);
