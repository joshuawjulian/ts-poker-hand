import { describe, expect, it } from 'vitest';
import { findLargestBlind } from '../engineUtils';
import { GameStateType } from '../state';

let basicState: GameStateType = {
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
	options: {
		reopenPercent: 1.0,
	},
	actionList: [],
};

describe('findLargestBlind()', () => {
	it('should return 0 if no blinds', () => {
		expect(findLargestBlind(basicState)).toEqual(0);
	});

	it('should return 2 in a 1/2 game', () => {
		const state = { ...basicState };
		state.actionList.push({
			action: 'blind',
			seat: 0,
			amount: 1,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'blind',
			seat: 1,
			amount: 2,
			isAllIn: false,
		});
		expect(findLargestBlind(state)).toEqual(2);
	});

	it('should return 5 in a single blind 5 game', () => {
		const state = { ...basicState };
		state.actionList.push({
			action: 'blind',
			seat: 0,
			amount: 5,
			isAllIn: false,
		});
		expect(findLargestBlind(state)).toEqual(5);
	});

	it('should return 20 in a 5/10/20 game', () => {
		const state = { ...basicState };
		state.actionList.push({
			action: 'blind',
			seat: 0,
			amount: 5,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'blind',
			seat: 1,
			amount: 10,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'blind',
			seat: 2,
			amount: 20,
			isAllIn: false,
		});
		expect(findLargestBlind(state)).toEqual(20);
	});
});
