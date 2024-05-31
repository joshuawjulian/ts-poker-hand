import { describe, expect, it } from 'vitest';
import { GameStateSchema, GameStateType, remainingStackSize } from './state';

export const gameStateSimpleSetup: GameStateType = {
	options: {
		fullRaiseToReopen: true,
	},
	players: [
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
	],
	actionList: [
		{ action: 'preflop' }, //0
		{ action: 'blind', seat: 0, amount: 1, isAllIn: false }, //1
		{ action: 'blind', seat: 1, amount: 2, isAllIn: false }, //2
		{ action: 'fold', seat: 2 }, //3
		{ action: 'fold', seat: 3 }, //4
		{ action: 'bet', seat: 4, amount: 10, isAllIn: false }, //5
		{ action: 'call', seat: 5, amount: 10, isAllIn: false }, //6
		{ action: 'fold', seat: 0 }, //7
		{ action: 'call', seat: 1, amount: 10, isAllIn: false }, //8
		{
			action: 'flop',
			flop: [
				{ rank: '2', suit: 'h' },
				{ rank: '3', suit: 'h' },
				{ rank: '4', suit: 'h' },
			],
		}, //9
		{ action: 'check', seat: 1 }, //10
		{ action: 'bet', seat: 4, amount: 20, isAllIn: false }, //11
		{ action: 'call', seat: 5, amount: 20, isAllIn: false }, //12
		{ action: 'fold', seat: 1 }, //13
		{ action: 'turn', turn: { rank: '5', suit: 'h' } }, //14
		{ action: 'check', seat: 4 }, //15
		{ action: 'check', seat: 5 }, //16
		{ action: 'river', river: { rank: '6', suit: 'h' } }, //17
		{ action: 'check', seat: 4 }, //18
		{ action: 'bet', seat: 5, amount: 70, isAllIn: true }, //19
		{ action: 'fold', seat: 4 }, //20
	],
};

export const emptyHeadsUp: GameStateType = {
	actionList: [],
	options: {
		fullRaiseToReopen: true,
	},
	players: [
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
	],
};

export const emptySixHanded: GameStateType = {
	actionList: [],
	options: {
		fullRaiseToReopen: true,
	},
	players: [
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
	],
};

describe('GameStateType', () => {
	it('should be a valid type', () => {
		const state: GameStateType = {
			options: {
				fullRaiseToReopen: true,
			},
			actionList: [],
			players: [
				{
					startingStack: 100,
					cards: [
						{ rank: 'X', suit: 'x' },
						{ rank: 'X', suit: 'x' },
					],
				},
				{
					startingStack: 100,
					cards: [
						{ rank: 'X', suit: 'x' },
						{ rank: 'X', suit: 'x' },
					],
				},
			],
		};
		expect(GameStateSchema.safeParse(state).success).toBe(true);
	});
	it('should be a valid type', () => {
		const state = gameStateSimpleSetup;
		expect(GameStateSchema.safeParse(state).success).toBe(true);
	});
});

describe('remainingStack()', () => {
	const state = gameStateSimpleSetup;
	it('should return remaining stack', () => {
		const result = remainingStackSize(state);
		expect(result).toEqual({
			0: 99,
			1: 90,
			2: 100,
			3: 100,
			4: 70,
			5: 0,
		});
	});
});
