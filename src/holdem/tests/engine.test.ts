import { describe, expect, it } from 'vitest';
import { next } from '../engine';
import { getMinMaxBet } from '../engineUtils';
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

describe('preflop blind/straddle cases', () => {
	it('first blind should have the option to reraise', () => {
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
		let options = next(state);
		expect(options.length).toEqual(3);
		expect(options.filter((o) => 'seat' in o && o.seat === 0).length).toEqual(
			options.length,
		);
		expect(options.filter((o) => o.action === 'call').length).toEqual(1);
		expect(options.filter((o) => o.action === 'fold').length).toEqual(1);
		expect(options.filter((o) => o.action === 'bet').length).toEqual(1);
	});

	it('second blind should have the option to raise', () => {
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
		let options = next(state);
		expect(options.length).toEqual(3);
		expect(options.filter((o) => 'seat' in o && o.seat === 1).length).toEqual(
			options.length,
		);
		expect(options.filter((o) => o.action === 'call').length).toEqual(1);
		expect(options.filter((o) => o.action === 'fold').length).toEqual(1);
		expect(options.filter((o) => o.action === 'bet').length).toEqual(1);
	});

	it('largest blind should be able to check if no larger opens', () => {
		let state = structuredClone(basicState);
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
		let options = next(state);
		//expect(options.length).toEqual(3);
		if ('seat' in options[0]) expect(options[0].seat).toEqual(1);
		expect(options.filter((o) => 'seat' in o && o.seat === 1).length).toEqual(
			options.length,
		);
		expect(options.filter((o) => o.action === 'check').length).toEqual(1);
		expect(options.filter((o) => o.action === 'fold').length).toEqual(1);
		expect(options.filter((o) => o.action === 'bet').length).toEqual(1);
	});
});

describe('min/max bet cases', () => {
	it('min/max should be the same and all of the stack if stack is less than full raise', () => {
		let state = structuredClone(basicState);
		state.players[0].startingStack = 100;
		state.players[1].startingStack = 100;
		state.players[2].startingStack = 100;
		state.players[3].startingStack = 50;
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
			amount: 45,
			isAllIn: false,
		});
		expect(getMinMaxBet(state)).toEqual([50, 50]);
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

	it('player shouldnt have the option to reopen if the undersized all in comes after they have acted', () => {
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
		state.actionList.push({
			action: 'fold',
			seat: 1,
		});

		let options = next(state);
		expect(options.length).toEqual(2);
		expect(options.filter((o) => 'seat' in o && o.seat === 2).length).toEqual(
			options.length,
		);
		expect(options.filter((o) => o.action === 'call').length).toEqual(1);
		expect(options.filter((o) => o.action === 'fold').length).toEqual(1);
		expect(options.filter((o) => o.action === 'bet').length).toEqual(0);
	});

	it('player can reopen after acting if all is large enough to reopen', () => {
		let state = structuredClone(basicFourHandedState);
		state.players[0].startingStack = 100;
		state.players[1].startingStack = 50;
		state.players[2].startingStack = 100;
		state.players[3].startingStack = 100;
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
			action: 'fold',
			seat: 3,
		});
		state.actionList.push({
			action: 'call',
			seat: 0,
			amount: 2,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'bet',
			seat: 1,
			amount: 50,
			isAllIn: true,
		});
		let options = next(state);
		expect(options.length).toEqual(3);
		expect(options.filter((o) => 'seat' in o && o.seat === 2).length).toEqual(
			options.length,
		);
		expect(options.filter((o) => o.action === 'call').length).toEqual(1);
		expect(options.filter((o) => o.action === 'fold').length).toEqual(1);
		expect(options.filter((o) => o.action === 'bet').length).toEqual(1);
	});
});

describe('Four Handed Testing', () => {
	it('should say preflop is the first action if there is no action', () => {
		let state = structuredClone(basicFourHandedState);
		let options = next(state);
		expect(options.length).toEqual(1);
		expect(options[0].action).toEqual('preflop');
	});

	it('largest blind should have option to check/bet/fold if no one opens (1 blind)', () => {
		let state = structuredClone(basicFourHandedState);
		state.actionList.push({ action: 'preflop' });
		state.actionList.push({
			action: 'blind',
			seat: 0,
			amount: 1,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'call',
			seat: 1,
			amount: 1,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'call',
			seat: 2,
			amount: 1,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'call',
			seat: 3,
			amount: 1,
			isAllIn: false,
		});
		let options = next(state);
		expect(options.length).toEqual(3);
		expect(options.filter((o) => 'seat' in o && o.seat === 0).length).toEqual(
			options.length,
		);
		expect(options.filter((o) => o.action === 'check').length).toEqual(1);
		expect(options.filter((o) => o.action === 'fold').length).toEqual(1);
		expect(options.filter((o) => o.action === 'bet').length).toEqual(1);
	});

	it('largest blind should have option to check/bet/fold if no one opens (2 blinds)', () => {
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
		let options = next(state);
		expect(options.length).toEqual(3);
		expect(options.filter((o) => 'seat' in o && o.seat === 1).length).toEqual(
			options.length,
		);
		expect(options.filter((o) => o.action === 'check').length).toEqual(1);
		expect(options.filter((o) => o.action === 'fold').length).toEqual(1);
		expect(options.filter((o) => o.action === 'bet').length).toEqual(1);
	});

	it('largest blind should have option to check/bet/fold if no one opens (3 blinds)', () => {
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
			action: 'blind',
			seat: 2,
			amount: 5,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'call',
			seat: 3,
			amount: 5,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'call',
			seat: 0,
			amount: 5,
			isAllIn: false,
		});
		state.actionList.push({
			action: 'call',
			seat: 1,
			amount: 5,
			isAllIn: false,
		});
		let options = next(state);
		expect(options.length).toEqual(3);
		expect(options.filter((o) => 'seat' in o && o.seat === 2).length).toEqual(
			options.length,
		);
		expect(options.filter((o) => o.action === 'check').length).toEqual(1);
		expect(options.filter((o) => o.action === 'fold').length).toEqual(1);
		expect(options.filter((o) => o.action === 'bet').length).toEqual(1);
	});

	it('should return flop if all preflop action is complete', () => {
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
			action: 'call',
			seat: 1,
			amount: 2,
			isAllIn: false,
		});
		let options = next(state);
		expect(options.length).toEqual(1);
		expect(options[0].action).toEqual('flop');
	});
});
