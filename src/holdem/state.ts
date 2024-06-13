import { z } from 'zod';
import {
	ActionSchema,
	DealerOptionType,
	PlayerActionType,
	PokerRoundType,
	PokerRounds,
	increaseWagerAction,
	isDealerAction,
} from './action';
import { CardSchema } from './card';

export const OptionsSchema = z.object({
	reopenPercent: z.number().default(1.0),
});

export type OptionsType = z.infer<typeof OptionsSchema>;

export const GameStateSchema = z.object({
	options: OptionsSchema.default({}),
	actionList: ActionSchema.array(),
	players: z
		.object({
			startingStack: z.union([z.number().positive(), z.literal('unknown')]),
			cards: CardSchema.array().length(2),
		})
		.array()
		.min(2),
});

export type GameStateType = z.infer<typeof GameStateSchema>;

export const stateAtIndex = (
	state: GameStateType,
	index: number,
): GameStateType => {
	if (index < 0 || index > state.actionList.length) throw 'Invalid index';
	let newState: GameStateType = { ...state };
	newState.actionList = state.actionList.slice(0, index);
	return newState;
};

export type ActionByRoundSeatType = Record<
	(typeof PokerRounds)[number],
	Record<number, PlayerActionType[]>
>;
export const getActionByRoundSeat = (
	state: GameStateType,
): ActionByRoundSeatType => {
	const actionByRound = getActionByRound(state);
	const actionBySeatByRound: ActionByRoundSeatType =
		{} as ActionByRoundSeatType;
	for (let round of PokerRounds) {
		actionBySeatByRound[round] = {} as Record<number, PlayerActionType[]>;
		for (let seat = 0; seat < state.players.length; seat++) {
			actionBySeatByRound[round][seat] = actionByRound[round].filter(
				(action) => action.seat === seat,
			);
		}
	}
	return actionBySeatByRound;
};

export type ActionBySeatRoundType = Record<
	number,
	Record<(typeof PokerRounds)[number], PlayerActionType[]>
>;
export const getActionBySeatRound = (
	state: GameStateType,
): ActionBySeatRoundType => {
	const actionByRound = getActionByRound(state);
	const actionBySeatByRound: ActionBySeatRoundType =
		{} as ActionBySeatRoundType;
	for (let seat = 0; seat < state.players.length; seat++) {
		actionBySeatByRound[seat] = {} as Record<
			(typeof PokerRounds)[number],
			PlayerActionType[]
		>;
		for (let round of PokerRounds) {
			actionBySeatByRound[seat][round] = actionByRound[round].filter(
				(action) => action.seat === seat,
			);
		}
	}
	return actionBySeatByRound;
};

export const getNextDealerOption = (state: GameStateType): DealerOptionType => {
	const roundIndexes = getRoundIndexes(state);
	const nextRound = PokerRounds.find((round) => roundIndexes[round] === -1);
	if (nextRound === undefined) return { action: 'showdown' };
	if (nextRound === 'flop') return { action: 'flop', cards: 3 };
	if (nextRound === 'turn') return { action: 'turn', cards: 1 };
	if (nextRound === 'river') return { action: 'river', cards: 1 };
	return { action: 'preflop' };
};

export const getCurrentRound = (state: GameStateType): PokerRoundType => {
	const roundIndexes = getRoundIndexes(state);
	let currentRound: PokerRoundType | undefined;
	PokerRounds.forEach((round) => {
		if (roundIndexes[round] !== -1) {
			currentRound = round;
		}
	});
	if (currentRound === undefined) return 'preflop';
	return currentRound;
};

export const largestWagerByRound = (
	state: GameStateType,
): Record<PokerRoundType, number> => {
	const actionByRound = getActionByRound(state);
	const largestWagerByRound: Record<PokerRoundType, number> = {} as Record<
		PokerRoundType,
		number
	>;
	for (let round of PokerRounds) {
		const wagers = actionByRound[round]
			.filter(increaseWagerAction)
			.map((action) => action.amount);

		largestWagerByRound[round] = Math.max(...wagers, 0);
	}
	return largestWagerByRound;
};

export type WageredEachRoundType = Record<
	number,
	Record<PokerRoundType, number>
>;

export const wageredEachRound = (
	state: GameStateType,
): WageredEachRoundType => {
	let wagered = {} as WageredEachRoundType;
	for (let seat = 0; seat < state.players.length; seat++) {
		wagered[seat] = {} as Record<PokerRoundType, number>;
		for (let round of PokerRounds) {
			wagered[seat][round] = 0;
		}
	}

	let currRound: PokerRoundType = 'preflop';
	for (let i = 0; i < state.actionList.length; i++) {
		const currAction = state.actionList[i];
		if (currAction.action === 'showdown') break;
		if (isDealerAction(currAction)) {
			currRound = currAction.action;
			continue;
		}
		if (currAction.action === 'fold' || currAction.action === 'check') continue;
		wagered[currAction.seat][currRound] = currAction.amount;
	}

	return wagered;
};

export const remainingStackSize = (
	state: GameStateType,
): Record<number, number | 'unknown'> => {
	let remainingStack = {} as Record<number, number | 'unknown'>;
	state.players.forEach((player, index) => {
		remainingStack[index] = player.startingStack;
	});

	let wagered = wageredEachRound(state);
	for (let seat = 0; seat < state.players.length; seat++) {
		let stack = remainingStack[seat];
		if (stack === 'unknown') continue;
		let totalForSeat = 0;
		for (let round of PokerRounds) {
			totalForSeat += wagered[seat][round];
		}
		remainingStack[seat] = stack - totalForSeat;
	}

	return remainingStack;
};

export const rotateArray = <T>(arr: T[], count: number): T[] => {
	return [...arr.slice(count), ...arr.slice(0, count)];
};

export const nextSeat = (seats: number[]): number[] => {
	let updatedSeats = rotateArray(seats, 1);
	console.log('nextSeat() | ' + seats + ' -> ' + updatedSeats);
	return updatedSeats;
};

export type RoundIndiciesType = {
	[round in PokerRoundType]: number;
};

export let getRoundIndicies = (state: GameStateType): RoundIndiciesType => {
	let roundIndicies: RoundIndiciesType = {
		preflop: -1,
		flop: -1,
		turn: -1,
		river: -1,
	};

	for (let i = state.actionList.length - 1; i >= 0; i--) {
		let currAction = state.actionList[i];
		if (isDealerAction(currAction)) {
			roundIndicies[currAction.action as PokerRoundType] = i;
		}
	}

	return roundIndicies;
};

export const toString = (state: GameStateType): string => {
	let str = '';
	for (let i = 0; i < state.actionList.length; i++) {
		const action = state.actionList[i];
		if (isDealerAction(action)) {
			str += action.action + '\n';
		} else {
			str += action.seat + ' ' + action.action + ' ';
			if ('amount' in action) str = str + action.amount;
			str = str + '\n';
		}
	}
	return str;
};

export let actionListToString = (state: GameStateType): string => {
	let str = '';
	for (let i = 0; i < state.actionList.length; i++) {
		const action = state.actionList[i];
		if (isDealerAction(action)) {
			str += `${action.action} `;
		} else {
			str += `[${action.seat}]${action.action} `;
			if ('amount' in action) str = str + action.amount;
		}
		str += ` | `;
	}
	return str;
};
