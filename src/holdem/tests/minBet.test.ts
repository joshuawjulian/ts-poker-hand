import { describe, expect, it } from 'vitest';
import { getMinBet } from '../engineUtils';
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
	actionList: [{ action: 'preflop' }],
};

describe('getMinBet()', () => {
	it('1/2, UTG should be 3', () => {
		let state = structuredClone(basicState);
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
		expect(getMinBet(state)).toEqual(3);
	});

	it('5/10/20, UTG should be 30', () => {
		let state = structuredClone(basicState);
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
		expect(getMinBet(state)).toEqual(30);
	});

	it('5 single blind, UTG should be 10', () => {
		let state = structuredClone(basicState);
		state.actionList.push({
			action: 'blind',
			seat: 0,
			amount: 5,
			isAllIn: false,
		});
		expect(getMinBet(state)).toEqual(10);
	});

	it('1/2, utg raises to 10, next should be 18', () => {
		let state = structuredClone(basicState);
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
			amount: 10,
			isAllIn: false,
		});
		expect(getMinBet(state)).toEqual(18);
	});

	it('1/2, utg raises to 10, next raises to 30, next should be 50', () => {
		let state = structuredClone(basicState);
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
			amount: 10,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'bet',
			seat: 3,
			amount: 30,
			isAllIn: false,
		});
		expect(getMinBet(state)).toEqual(50);
	});

	it('1/2, on the flop first action should 2', () => {
		let state = structuredClone(basicState);
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
			seat: 4,
			amount: 2,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'call',
			seat: 5,
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
		state.actionList.push({
			action: 'flop',
			flop: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		});
		expect(getMinBet(state)).toEqual(2);
	});

	it('1/2, all in for less than a good open, should not change the min', () => {
		let state = structuredClone(basicState);
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
			amount: 10,
			isAllIn: false,
		});
		state.players[3].startingStack = 5;
		state.actionList.push({
			action: 'call',
			seat: 3,
			amount: 5,
			isAllIn: true,
		});
		expect(getMinBet(state)).toEqual(18);
	});

	it('1/2, all in for less (twice) than a good open, should not change the min', () => {
		let state = structuredClone(basicState);
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
			amount: 10,
			isAllIn: false,
		});
		state.players[3].startingStack = 5;
		state.actionList.push({
			action: 'call',
			seat: 3,
			amount: 5,
			isAllIn: true,
		});
		state.players[4].startingStack = 8;
		state.actionList.push({
			action: 'call',
			seat: 4,
			amount: 8,
			isAllIn: true,
		});
		expect(getMinBet(state)).toEqual(18);
	});

	it('1/2, all in for less (twice not in a row) than a good open, should not change the min', () => {
		let state = structuredClone(basicState);
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
		state.players[2].startingStack = 10;
		state.actionList.push({
			action: 'bet',
			seat: 2,
			amount: 10,
			isAllIn: true,
		});
		state.actionList.push({
			action: 'bet',
			seat: 3,
			amount: 25,
			isAllIn: true,
		});
		expect(getMinBet(state)).toEqual(40);
	});
});
