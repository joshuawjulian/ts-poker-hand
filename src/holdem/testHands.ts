import { HoldemStateType } from './state.js';

export const preBuiltTestHandOne: HoldemStateType = {
  seats: [
    {
      startingStack: 200,
    },
    {
      startingStack: 200,
    },
    {
      startingStack: 200,
    },
    {
      startingStack: 200,
    },
    {
      startingStack: 'unk',
    },
    {
      startingStack: 200,
    },
  ],
  actionList: [
    { action: 'preflop' },
    { action: 'blind', seat: 0, amount: 1, isAllIn: false },
    { action: 'blind', seat: 1, amount: 2, isAllIn: false },
    { action: 'bet', seat: 2, amount: 10, isAllIn: false },
    { action: 'fold', seat: 3 },
    { action: 'fold', seat: 4 },
    { action: 'call', seat: 5, amount: 10, isAllIn: false },
    { action: 'fold', seat: 0 },
    { action: 'call', seat: 1, amount: 10, isAllIn: false },
    {
      action: 'flop',
      cards: [
        { rank: 'A', suit: 'h' },
        { rank: 'A', suit: 'd' },
        { rank: 'A', suit: 'c' },
      ],
    },
    { action: 'check', seat: 1 },
    { action: 'bet', seat: 2, amount: 12, isAllIn: false },
    { action: 'bet', seat: 5, amount: 40, isAllIn: false },
    { action: 'call', seat: 1, amount: 40, isAllIn: false },
    { action: 'fold', seat: 2 },
    {
      action: 'turn',
      card: { rank: 'A', suit: 's' },
    },
  ],
};

export const UTGStraddleHand = {
  seats: [
    {
      startingStack: 200,
    },
    {
      startingStack: 200,
    },
    {
      startingStack: 200,
    },
    {
      startingStack: 200,
    },
    {
      startingStack: 'unk',
    },
    {
      startingStack: 200,
    },
  ],
  actionList: [
    { action: 'preflop' },
    { action: 'blind', seat: 0, amount: 1, isAllIn: false },
    { action: 'blind', seat: 1, amount: 2, isAllIn: false },
    { action: 'straddle', seat: 2, amount: 5, isAllIn: false },
    { action: 'bet', seat: 3, amount: 15, isAllIn: false },
    { action: 'fold', seat: 4 },
    { action: 'call', seat: 5, amount: 15, isAllIn: false },
  ],
};
