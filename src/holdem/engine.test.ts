import { expect, test, assert } from 'vitest';
import { type HoldemStateType, setupBasicHoldemGame } from './state.js';
import {
  actionsByRound,
  hasSeatActedThisRound,
  largestAggressiveAction,
  nextAction,
  playerActionsBySeat,
  seatsLastAction,
  whatRound,
} from './engine.js';
import { preBuiltTestHandOne, preflopCallHand } from './testHands.js';

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

test('largestAggressiveAction', () => {
  let act = largestAggressiveAction(
    actionsByRound(preBuiltTestHandOne)['preflop'],
  );
  if (act === 'none') return;
  expect(act.action).toBe('bet');
  expect(act.seat).toBe(2);
});

test('preflop calling', () => {
  const hand = preflopCallHand;
  const nextActions = nextAction(hand);
  console.log(nextActions);
  expect(nextActions.seat).to.equal(1);
  if (!('actions' in nextActions)) {
    assert(false);
  }
  expect(nextActions.actions.length).to.equal(3);
});
