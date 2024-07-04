import { describe, expect, it } from 'vitest';
import { actionComplete, findLargestBlind, getSeatOrder } from '../engineUtils';
import { GameStateType, getBets } from '../state';

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

let basicFourHandedState: GameStateType = {
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
		const state = structuredClone(basicState);
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

describe('getSeatsOrder()', () => {
	let prestate = structuredClone(basicState);
	prestate.actionList.push({ action: 'preflop' });
	it('should return [0, 1, 2, 3, 4, 5]', () => {
		let state = structuredClone(prestate);
		expect(getSeatOrder(state)).toEqual([0, 1, 2, 3, 4, 5]);
	});

	it('should return [1, 2, 3, 4, 5, 0] after 1 blind', () => {
		let state = structuredClone(prestate);
		state.actionList.push({
			action: 'blind',
			seat: 0,
			amount: 1,
			isAllIn: false,
		});
		expect(getSeatOrder(state)).toEqual([1, 2, 3, 4, 5, 0]);
	});

	it('should return [2, 3, 4, 5, 0, 1] after 2 blinds', () => {
		let state = structuredClone(prestate);
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
		expect(getSeatOrder(state)).toEqual([2, 3, 4, 5, 0, 1]);
	});

	it('should return [4, 5, 0, 1, 3]', () => {
		let state = structuredClone(prestate);
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
		state.actionList.push({
			action: 'fold',
			seat: 2,
		});
		state.actionList.push({
			action: 'call',
			seat: 3,
			amount: 2,
			isAllIn: false,
		});
		expect(getSeatOrder(state)).toEqual([4, 5, 0, 1, 3]);
	});

	it('should return [0, 1] after eveyone else folds', () => {
		let state = structuredClone(prestate);
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
		state.actionList.push({
			action: 'fold',
			seat: 2,
		});
		state.actionList.push({
			action: 'fold',
			seat: 3,
		});
		state.actionList.push({
			action: 'fold',
			seat: 4,
		});
		state.actionList.push({
			action: 'fold',
			seat: 5,
		});
		expect(getSeatOrder(state)).toEqual([0, 1]);
	});

	it('should return [1, 0] after eveyone else folds, and sb calls', () => {
		let state = structuredClone(prestate);
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
		state.actionList.push({
			action: 'fold',
			seat: 2,
		});
		state.actionList.push({
			action: 'fold',
			seat: 3,
		});
		state.actionList.push({
			action: 'fold',
			seat: 4,
		});
		state.actionList.push({
			action: 'fold',
			seat: 5,
		});
		state.actionList.push({
			action: 'call',
			seat: 0,
			amount: 2,
			isAllIn: false,
		});
		expect(getSeatOrder(state)).toEqual([1, 0]);
	});

	it('should return [1, 2]', () => {
		let state = structuredClone(basicState);
		state.players[3].startingStack = 50;
		state.actionList.push({ action: 'preflop' });
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
		state.actionList.push({
			action: 'bet',
			seat: 2,
			amount: 45,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'bet',
			seat: 3,
			amount: 50,
			isAllIn: true,
		});
		state.actionList.push({
			action: 'fold',
			seat: 4,
		});
		state.actionList.push({
			action: 'fold',
			seat: 5,
		});
		state.actionList.push({
			action: 'fold',
			seat: 0,
		});
		expect(getSeatOrder(state)).toEqual([1, 2]);
	});
});

describe('actionComplete()', () => {
	it('should return false if no actions', () => {
		let state = structuredClone(basicFourHandedState);
		expect(actionComplete(state)).toEqual(false);
	});

	it('should return false if just starting preflop', () => {
		let state = structuredClone(basicFourHandedState);
		state.actionList.push({ action: 'preflop' });
		expect(actionComplete(state)).toEqual(false);
	});

	it('should return true preflop if everyone only checks and calls', () => {
		let state = structuredClone(basicFourHandedState);
		state.actionList.push({ action: 'preflop' });
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
		state.actionList.push({
			action: 'call',
			seat: 2,
			amount: 2,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'call',
			seat: 3,
			amount: 2,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'call',
			seat: 0,
			amount: 2,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'check',
			seat: 1,
		});
		expect(getBets(state)).toEqual([]);
		expect(actionComplete(state)).toEqual(true);
	});

	it('should return false preflop if the BB doesnt check', () => {
		let state = structuredClone(basicFourHandedState);
		state.actionList.push({ action: 'preflop' });
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
		state.actionList.push({
			action: 'call',
			seat: 2,
			amount: 2,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'call',
			seat: 3,
			amount: 2,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'call',
			seat: 0,
			amount: 2,
			isAllIn: false,
		});
		expect(actionComplete(state)).toEqual(false);
	});

	it('should return true when an all in has occurred and everyone folds', () => {
		let state = structuredClone(basicFourHandedState);
		state.actionList.push({ action: 'preflop' });
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
		state.actionList.push({
			action: 'bet',
			seat: 2,
			amount: 100,
			isAllIn: true,
		});
		state.actionList.push({
			action: 'fold',
			seat: 3,
		});
		state.actionList.push({
			action: 'fold',
			seat: 0,
		});
		state.actionList.push({
			action: 'fold',
			seat: 1,
		});
		expect(actionComplete(state)).toEqual(true);
	});

	it('should return true when an all in has occurred and a player after calls for less', () => {
		let state = structuredClone(basicFourHandedState);
		state.players[3].startingStack = 50;
		state.actionList.push({ action: 'preflop' });
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
		state.actionList.push({
			action: 'bet',
			seat: 2,
			amount: 100,
			isAllIn: true,
		});
		state.actionList.push({
			action: 'call',
			seat: 3,
			amount: 50,
			isAllIn: true,
		});
		state.actionList.push({
			action: 'fold',
			seat: 0,
		});
		state.actionList.push({
			action: 'fold',
			seat: 1,
		});
		expect(actionComplete(state)).toEqual(true);
	});
});
