import { describe, expect, it } from 'vitest';
import { GameStateType, stateAtIndex } from './state';
import {
	getActionByRound,
	getAllInAndFoldedPlayers,
	getAllInPlayers,
	getFoldedPlayers,
	getLastDealerAction,
	getRoundIndexes,
	next,
} from './engine';
import {
	emptyHeadsUp,
	emptySixHanded,
	gameStateSimpleSetup,
} from './state.test';

describe('Basic Game Testing', () => {
	it('should return preflop on empty game', () => {
		const state: GameStateType = emptyHeadsUp;

		expect(next(state)).toEqual([{ action: 'preflop' }]);
	});

	describe('Simple Setup', () => {
		it('getLastDealerAction() | Preflop', () => {
			const action = getLastDealerAction(stateAtIndex(gameStateSimpleSetup, 5));
			expect(action).toEqual({
				action: 'preflop',
			});
		});
	});
});

describe('getFoldedPlayers()', () => {
	describe('Simple Setup', () => {
		const state = stateAtIndex(gameStateSimpleSetup, 8);
		it('should return [0, 2, 3] after preflop', () => {
			const result = getFoldedPlayers(state);
			expect(result).toEqual([0, 2, 3]);
		});
	});

	it('should return empty array on preflop', () => {
		const state: GameStateType = emptyHeadsUp;
		const result = getFoldedPlayers(state);
		expect(result).toEqual([]);
	});
});

describe('getRoundIndexes()', () => {
	const state: GameStateType = emptyHeadsUp;
	it('empty game should be all -1', () => {
		const result = getRoundIndexes(state);
		expect(result).toEqual({
			preflop: -1,
			flop: -1,
			turn: -1,
			river: -1,
		});
	});

	it('simple game', () => {
		const state = stateAtIndex(gameStateSimpleSetup, 20);
		const resultIndexes = getRoundIndexes(state);
		expect(resultIndexes).toEqual({
			preflop: 0,
			flop: 9,
			turn: 14,
			river: 17,
		});
	});
});

describe('getActionByRound()', () => {
	const state = gameStateSimpleSetup;
	it('simple game', () => {
		const resultActionByRound = getActionByRound(state);
		expect(resultActionByRound).toEqual({
			preflop: [
				{ action: 'blind', seat: 0, amount: 1, isAllIn: false }, //1
				{ action: 'blind', seat: 1, amount: 2, isAllIn: false }, //2
				{ action: 'fold', seat: 2 }, //3
				{ action: 'fold', seat: 3 }, //4
				{ action: 'bet', seat: 4, amount: 10, isAllIn: false }, //5
				{ action: 'call', seat: 5, amount: 10, isAllIn: false }, //6
				{ action: 'fold', seat: 0 }, //7
				{ action: 'call', seat: 1, amount: 10, isAllIn: false }, //8
			],
			flop: [
				{ action: 'check', seat: 1 }, //10
				{ action: 'bet', seat: 4, amount: 20, isAllIn: false }, //11
				{ action: 'call', seat: 5, amount: 20, isAllIn: false }, //12
				{ action: 'fold', seat: 1 }, //13
			],
			turn: [
				{ action: 'check', seat: 4 }, //15
				{ action: 'check', seat: 5 }, //16
			],
			river: [
				{ action: 'check', seat: 4 }, //18
				{ action: 'bet', seat: 5, amount: 70, isAllIn: true }, //19
				{ action: 'fold', seat: 4 }, //20
			],
		});
	});
});

describe('all in and folded players', () => {
	describe('simple game', () => {
		const state = gameStateSimpleSetup;
		it('all players should be allIn or folded', () => {
			const resultPlayers = getFoldedPlayers(state);
			expect(resultPlayers).toEqual([0, 1, 2, 3, 4]);
			const allInPlayers = getAllInPlayers(state);
			expect(allInPlayers).toEqual([5]);
			const result = getAllInAndFoldedPlayers(state);
			expect(result).toEqual([0, 1, 2, 3, 4, 5]);
		});
	});
});

describe('Starting a game preflop - no action', () => {
	let state = { ...emptySixHanded };
	let options = next(state);
	it('should have 1 option', () => {
		expect(options.length).toEqual(1);
	});
	it('should have a bet option', () => {
		const betOption = options.find((o) => o.action === 'preflop');
		expect(betOption).toBeDefined();
	});
});

describe('Starting a game preflop - dealer posted preflop', () => {
	const state = { ...emptySixHanded };
	state.actionList.push({ action: 'preflop' });
	state.actionList.push({
		action: 'blind',
		seat: 0,
		amount: 1,
		isAllIn: false,
	});
	let options = next(state);
	it('should have 5 options', () => {
		expect(options.length).toEqual(5);
	});
	it('should have a bet option', () => {
		const betOption = options.find((o) => o.action === 'bet');
		expect(betOption).toBeDefined();
	});
	it('should have a call option', () => {
		const callOption = options.find((o) => o.action === 'call');
		expect(callOption).toBeDefined();
	});
	it('should have a blind option', () => {
		const blindOption = options.find((o) => o.action === 'blind');
		expect(blindOption).toBeDefined();
	});
	it('should have a straddle option', () => {
		const straddleOption = options.find((o) => o.action === 'straddle');
		expect(straddleOption).toBeDefined();
	});
	it('should have a fold option', () => {
		const foldOption = options.find((o) => o.action === 'fold');
		expect(foldOption).toBeDefined();
	});
	state.actionList.push({
		action: 'blind',
		seat: 1,
		amount: 2,
		isAllIn: false,
	});
	options = next(state);
	it('should have 5 options', () => {
		expect(options.length).toEqual(5);
	});
	it('should have a bet option', () => {
		const betOption = options.find((o) => o.action === 'bet');
		expect(betOption).toBeDefined();
	});
	it('should have a call option', () => {
		const callOption = options.find((o) => o.action === 'call');
		expect(callOption).toBeDefined();
	});
	it('should have a blind option', () => {
		const blindOption = options.find((o) => o.action === 'blind');
		expect(blindOption).toBeDefined();
	});
	it('should have a straddle option', () => {
		const straddleOption = options.find((o) => o.action === 'straddle');
		expect(straddleOption).toBeDefined();
	});
	it('should have a fold option', () => {
		const foldOption = options.find((o) => o.action === 'fold');
		expect(foldOption).toBeDefined();
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
	options = next(state);
	it('sb should have 3 options bet/call/fold', () => {
		expect(options.length).toEqual(3);
	});
	it('should have a bet option', () => {
		const betOption = options.find((o) => o.action === 'bet');
		expect(betOption).toBeDefined();
	});
	it('should have a call option', () => {
		const callOption = options.find((o) => o.action === 'call');
		expect(callOption).toBeDefined();
	});
	it('should have a fold option', () => {
		const foldOption = options.find((o) => o.action === 'fold');
		expect(foldOption).toBeDefined();
	});

	state.actionList.push({
		action: 'call',
		seat: 0,
		amount: 1,
		isAllIn: false,
	});

	it('sb should have 3 options bet/check/fold', () => {
		expect(options.length).toEqual(3);
	});
	it('should have a bet option', () => {
		const betOption = options.find((o) => o.action === 'bet');
		expect(betOption).toBeDefined();
	});
	it('should have a check option', () => {
		const checkOption = options.find((o) => o.action === 'check');
		expect(checkOption).toBeDefined();
	});
	it('should have a fold option', () => {
		const foldOption = options.find((o) => o.action === 'fold');
		expect(foldOption).toBeDefined();
	});
});
