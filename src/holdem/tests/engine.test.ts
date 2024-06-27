import { describe, expect, it } from 'vitest';
import { next } from '../engine';
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

describe('Basic Setup', () => {
	it('should say preflop is the first action if there is no action', () => {
		let state = structuredClone(basicState);
		let options = next(state);
		expect(options.length).toEqual(1);
		expect(options[0].action).toEqual('preflop');
	});

	it('should say blind after preflop', () => {
		let state = structuredClone(basicState);
		state.actionList.push({ action: 'preflop' });
		let options = next(state);
		expect(options.length).toEqual(1);
		expect(options[0].action).toEqual('blind');
	});
});

describe('reopen edge cases', () => {
	it('have a stack smaller than the bet, should only allow call/fold', () => {
		let state = structuredClone(basicState);
		state.players[0].startingStack = 100;
		state.players[1].startingStack = 100;
		state.players[2].startingStack = 10;
		state.players[3].startingStack = 7;
		state.players[4].startingStack = 100;
		state.players[5].startingStack = 100;
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
			amount: 10,
			isAllIn: true,
		});
		let options = next(state);
		expect(options.length).toEqual(2);
		expect(options.filter((o) => o.action === 'call').length).toEqual(1);
		expect(options.filter((o) => o.action === 'fold').length).toEqual(1);
		state.actionList.push({
			action: 'call',
			seat: 3,
			amount: 7,
			isAllIn: true,
		});
		options = next(state);
		expect(options.length).toEqual(3);
		expect(options.filter((o) => o.action === 'call').length).toEqual(1);
		expect(options.filter((o) => o.action === 'fold').length).toEqual(1);
		expect(options.filter((o) => o.action === 'bet').length).toEqual(1);
	});
});
