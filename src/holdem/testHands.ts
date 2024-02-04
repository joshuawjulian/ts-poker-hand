import { nextAction, nextActionAtIndex } from './engine.js';
import { HoldemStateType } from './state.js';
import { printStateTable } from './utils.js';

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

const errorHand1: HoldemStateType = {
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
      startingStack: 200,
    },
    {
      startingStack: 200,
    },
  ],
  actionList: [
    {
      action: 'preflop',
    },
    {
      action: 'blind',
      seat: 0,
      amount: 1,
      isAllIn: false,
    },
    {
      action: 'blind',
      seat: 1,
      amount: 2,
      isAllIn: false,
    },
    {
      seat: 2,
      action: 'bet',
      amount: 28,
      isAllIn: false,
    },
    {
      seat: 3,
      action: 'bet',
      amount: 133,
      isAllIn: false,
    },
    {
      seat: 4,
      action: 'bet',
      amount: 151,
      isAllIn: false,
    },
    {
      seat: 5,
      action: 'fold',
    },
    {
      seat: 0,
      action: 'call',
      amount: 151,
      isAllIn: false,
    },
    {
      seat: 1,
      action: 'fold',
    },
    {
      seat: 2,
      action: 'call',
      amount: 151,
      isAllIn: false,
    },
    {
      seat: 3,
      action: 'call',
      amount: 151,
      isAllIn: false,
    },
    {
      action: 'flop',
      cards: [
        {
          suit: 'd',
          rank: 'J',
        },
        {
          suit: 'd',
          rank: '2',
        },
        {
          suit: 'h',
          rank: '3',
        },
      ],
    },
    {
      seat: 0,
      action: 'check',
    },
    {
      seat: 2,
      action: 'check',
    },
    {
      seat: 3,
      action: 'bet',
      amount: 31,
      isAllIn: false,
    },
    {
      seat: 4,
      action: 'call',
      amount: 31,
      isAllIn: false,
    },
    {
      seat: 0,
      action: 'fold',
    },
  ],
};

export const preflopCallHand: HoldemStateType = {
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
      startingStack: 200,
    },
    {
      startingStack: 200,
    },
  ],
  actionList: [
    {
      action: 'preflop',
    },
    {
      action: 'blind',
      seat: 0,
      amount: 1,
      isAllIn: false,
    },
    {
      action: 'blind',
      seat: 1,
      amount: 2,
      isAllIn: false,
    },
    {
      seat: 2,
      action: 'call',
      amount: 2,
      isAllIn: false,
    },
    {
      seat: 3,
      action: 'call',
      amount: 2,
      isAllIn: false,
    },
    {
      seat: 4,
      action: 'call',
      amount: 2,
      isAllIn: false,
    },
    {
      seat: 5,
      action: 'call',
      amount: 2,
      isAllIn: false,
    },
    {
      seat: 0,
      action: 'call',
      amount: 2,
      isAllIn: false,
    },
  ],
};
