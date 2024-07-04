import { describe, expect, it } from 'vitest';
import { next } from '../engine';
import { validateState } from '../engineUtils';
import { GameStateType } from '../state';
import { optionArrayToString } from './testUtil';

let basicFourHandedState: GameStateType = {
	players: [
		{
			startingStack: 25,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 50,
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
			startingStack: 65,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
	],
	options: {
		reopenPercent: 1.0,
	},
	actionList: [{ action: 'preflop' }],
};

describe('Full Hand Testing (4)', () => {
	describe('Multiple Stack Sizes with allIns', () => {
		let fourhandstate = structuredClone(basicFourHandedState);
		fourhandstate.players[0].startingStack = 25;
		fourhandstate.players[1].startingStack = 100;
		fourhandstate.players[2].startingStack = 50;
		fourhandstate.players[3].startingStack = 65;

		it('should have an option of blind', () => {
			let state = structuredClone(fourhandstate);
			let options = next(state);
			expect(options.length).toEqual(1);
			expect(options.filter((o) => 'seat' in o && o.seat === 0).length).toEqual(
				options.length,
			);
			expect(optionArrayToString(options)).toEqual(['blind']);
		});

		it('should have an option of blind/straddle/fold/call/bet with only blind', () => {
			let state = structuredClone(fourhandstate);
			state.actionList.push({
				action: 'blind',
				seat: 0,
				amount: 1,
				isAllIn: false,
			});
			let options = next(state);
			expect(options.filter((o) => 'seat' in o && o.seat === 1).length).toEqual(
				options.length,
			);

			expect(optionArrayToString(options)).toEqual(
				expect.arrayContaining(['fold', 'blind', 'straddle', 'call', 'bet']),
			);
		});
	});
});

describe('validateState()', () => {
	let state: GameStateType = {
		players: [
			{
				startingStack: 25,
				cards: [
					{ rank: 'X', suit: 'x' },
					{ rank: 'X', suit: 'x' },
				],
			},
			{
				startingStack: 50,
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
				startingStack: 65,
				cards: [
					{ rank: 'X', suit: 'x' },
					{ rank: 'X', suit: 'x' },
				],
			},
		],
		options: {
			reopenPercent: 1.0,
		},
		actionList: [
			{ action: 'preflop' },
			{ action: 'blind', seat: 0, amount: 1, isAllIn: false },
			{ action: 'blind', seat: 1, amount: 2, isAllIn: false },
			{ action: 'call', seat: 2, amount: 2, isAllIn: false },
			{ action: 'bet', seat: 3, amount: 25, isAllIn: false },
			{ action: 'call', seat: 0, amount: 25, isAllIn: true },
			{ action: 'fold', seat: 1 },
			{ action: 'fold', seat: 2 },
			{
				action: 'flop',
				flop: [
					{ rank: 'X', suit: 'x' },
					{ rank: 'X', suit: 'x' },
					{ rank: 'X', suit: 'x' },
				],
			},
			{ action: 'turn', turn: { rank: 'X', suit: 'x' } },
			{ action: 'river', river: { rank: 'X', suit: 'x' } },
		],
	};
	expect(validateState(state)).toEqual(true);
});
