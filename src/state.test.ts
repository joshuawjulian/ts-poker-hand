import { expect, test } from 'vitest';
import {
	HoldemStateType,
	numberOfPlayers,
	setupBasicHoldemGame,
} from './state.js';
import { basicPrintStateTable } from './print.js';

test('numberOfPlayers', () => {
	const game = setupBasicHoldemGame(6, 1, 2);
	expect(numberOfPlayers(game)).toBe(6);
});

test(`setupBasicHoldemGame`, () => {
	const game = setupBasicHoldemGame(6, 1, 2);
	expect(game.seats.length).toBe(6);
	expect(game.actionList[0].action).toBe('preflop');
	expect(game.actionList[1].action).toBe('blind');
	expect(game.actionList[2].action).toBe('blind');
});

test(`basicPrintStateTable`, () => {
	const game = setupBasicHoldemGame(6, 1, 2);
	basicPrintStateTable(game);
});
