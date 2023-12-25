import { expect, test } from 'vitest';
import { type HoldemStateType, setupBasicHoldemGame } from './state.js';
import {
	hasSeatActedThisRound,
	playerActionsBySeat,
	whatRound,
} from './engine.js';

test('hasSeatActedThisRound - 6 max', () => {
	let gameTestOne: HoldemStateType = setupBasicHoldemGame(6, 1, 2);
	expect(hasSeatActedThisRound(0, gameTestOne)).toBeTruthy();
	expect(hasSeatActedThisRound(1, gameTestOne)).toBeTruthy();
	expect(hasSeatActedThisRound(2, gameTestOne)).toBeFalsy();
	expect(hasSeatActedThisRound(3, gameTestOne)).toBeFalsy();
	expect(hasSeatActedThisRound(4, gameTestOne)).toBeFalsy();
	expect(hasSeatActedThisRound(5, gameTestOne)).toBeFalsy();
	expect(hasSeatActedThisRound(6, gameTestOne)).toThrowError();
});

test('whatRound', () => {
	let gameTestOne: HoldemStateType = setupBasicHoldemGame(6, 1, 2);
	expect(whatRound(gameTestOne)).to.equal('preflop');
});

test('playerActionsBySeat', () => {
	let gameTestOne: HoldemStateType = setupBasicHoldemGame(6, 1, 2);
	console.log(playerActionsBySeat(gameTestOne));
});
