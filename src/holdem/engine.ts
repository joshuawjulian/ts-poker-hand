import { number, z } from 'zod';
import {
  ActionsType,
  CheckActionOption,
  FoldActionOption,
  NextActionOptionType,
  PlayerActionOptionType,
  PlayerActionsType,
  betActionOption,
  isDealerAction,
  isPlayerAction,
} from './action.js';
import { HoldemStateType, PokerRoundsType } from './state.js';
import { preBuiltTestHandOne } from './testHands.js';

import {
  actionListSingleLine,
  advanceRound,
  arrayDiff,
  cycleSeats,
  isNumber,
  numberToRound,
  printStateTable,
  roundToNumber,
} from './utils.js';
import { error } from 'console';
import { emitKeypressEvents } from 'readline';

export type BetOptionType = {
  option: 'bet';
  range: {
    min: number;
    max: number;
  };
};

export type CallOptionType = {
  option: 'call';
  amount: number;
};

export type CheckOptionType = {
  option: 'check';
};

export type FoldOptionType = {
  option: 'fold';
};

export type OptionType =
  | BetOptionType
  | CallOptionType
  | CheckOptionType
  | FoldOptionType;

export type NextType = {
  seat: number;
  options: OptionType[];
};

// export const next = (state: HoldemStateType): NextType => {};

export const seatNext = (state: HoldemStateType): number => {
  return 0;
};

export const hasSeatActedThisRound = (
  seat: number,
  state: HoldemStateType,
): boolean => {
  if (state.seats.length < seat) throw new Error(`hasSeatActedThisRound() - `);

  return false;
};

export const whatRoundAtIndex = (state: HoldemStateType, idx: number) => {
  if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;
  let latest: PokerRoundsType = 'preflop';
  for (let i = 0; i <= idx; i++) {
    let currAction = state.actionList[i];
    if (isDealerAction(currAction)) {
      latest = currAction.action;
    }
  }
  return latest;
};

export const whatRound = (state: HoldemStateType): PokerRoundsType => {
  return whatRoundAtIndex(state, state.actionList.length - 1);
};

export const playerActionsBySeat = (state: HoldemStateType) => {
  const m = new Map<number, PlayerActionsType[]>();
  for (let i = 0; i < state.seats.length; i++) m.set(i, []);
  for (let a of state.actionList) {
    if (isPlayerAction(a)) {
      let newList = m.get(a.seat);
      if (newList === undefined) newList = [a];
      else newList.push(a);
      m.set(a.seat, newList);
    }
  }
  return m;
};

export type StackBetPerRoundType = { [index: string]: number[] };
export type StackRemainingPerRoundType = {
  [index: string]: (number | 'unk')[];
};

export const blankStackBetPerRound = (
  numberSeats: number,
): StackBetPerRoundType => {
  const zeroArray = new Array(numberSeats).fill(0);
  return {
    preflop: [...zeroArray],
    flop: [...zeroArray],
    turn: [...zeroArray],
    river: [...zeroArray],
  };
};

export const stackBetPerRoundAtIndex = (
  state: HoldemStateType,
  idx: number,
) => {
  if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;
  let running = blankStackBetPerRound(state.seats.length);
  for (let i = 0; i <= idx; i++) {
    const currAction = state.actionList[i];
    if (isDealerAction(currAction)) continue;
    if (currAction.action === 'fold' || currAction.action === 'check') continue;
    // !TODO Handle Antes
    let round = whatRoundAtIndex(state, i);
    running[round][currAction.seat] = currAction.amount;
  }
  return running;
};
export const stackBetPerRound = (state: HoldemStateType) => {
  return stackBetPerRoundAtIndex(state, state.actionList.length - 1);
};

export const totalBetsPerSeatAtIndex = (
  state: HoldemStateType,
  idx: number,
): number[] => {
  if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;

  const betsPerRound = stackBetPerRoundAtIndex(state, idx);
  let bets = new Array(state.seats.length).fill(0);
  for (let round in betsPerRound) {
    betsPerRound[round].forEach((value, seat) => {
      bets[seat] += value;
    });
  }
  return bets;
};

export const totalBetsPerSeat = (state: HoldemStateType) => {
  return totalBetsPerSeatAtIndex(state, state.actionList.length - 1);
};

export const stackRemainingAtIndex = (
  state: HoldemStateType,
  idx: number,
): (number | 'unk')[] => {
  if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;
  const bps = totalBetsPerSeatAtIndex(state, idx);
  let stacks = new Array(state.seats.length).fill(0);
  for (let i = 0; i < stacks.length; i++) {
    let stack: number | 'unk' = state.seats[i].startingStack;
    if (isNumber(stack)) stacks[i] = stack - bps[i];
    else stacks[i] = 'unk';
  }
  return stacks;
};

export const stackRemaining = (state: HoldemStateType) => {
  return stackRemainingAtIndex(state, state.actionList.length - 1);
};

export const bettableStackRemainingAtIndex = (
  state: HoldemStateType,
  idx: number,
) => {
  if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;
  const sbpr = stackBetPerRoundAtIndex(state, idx);
  const currRound = whatRound(state);
  let stacks: StackRemainingPerRoundType = blankStackBetPerRound(
    state.seats.length,
  );
  for (let i = 0; i < state.seats.length; i++) {
    const startingStack = state.seats[i].startingStack;
    if (!isNumber(startingStack)) {
      stacks['preflop'][i] = 'unk';
      stacks['flop'][i] = 'unk';
      stacks['turn'][i] = 'unk';
      stacks['river'][i] = 'unk';
    } else {
      stacks['preflop'][i] = startingStack;
      stacks['flop'][i] = startingStack - sbpr['preflop'][i];
      stacks['turn'][i] = startingStack - sbpr['preflop'][i] - sbpr['flop'][i];
      stacks['river'][i] =
        startingStack - sbpr['preflop'][i] - sbpr['flop'][i] - sbpr['turn'][i];
    }
  }

  return stacks;
};

export const bettableStackRemaining = (state: HoldemStateType) => {
  return bettableStackRemainingAtIndex(state, state.actionList.length - 1);
};

export type ActionsByRoundType = {
  [index: string]: PlayerActionsType[];
};

export const blankActionsByRound = (numberSeats: number) => {
  const zeroArray = new Array<PlayerActionsType>(numberSeats);
  return {
    preflop: new Array<PlayerActionsType>(),
    flop: new Array<PlayerActionsType>(),
    turn: new Array<PlayerActionsType>(),
    river: new Array<PlayerActionsType>(),
  };
};

export const actionsByRoundAtIndex = (
  state: HoldemStateType,
  idx: number,
): ActionsByRoundType => {
  let actions = blankActionsByRound(state.seats.length);
  if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;
  let currRound = 'preflop';
  for (let i = 0; i <= idx; i++) {
    const act = state.actionList[i];
    if (isPlayerAction(act)) {
      if (
        currRound === 'preflop' ||
        currRound === 'flop' ||
        currRound === 'turn' ||
        currRound === 'river'
      )
        actions[currRound].push(act);
    } else {
      currRound = act.action;
    }
  }
  return actions;
};

export const actionsByRound = (state: HoldemStateType) => {
  return actionsByRoundAtIndex(state, state.actionList.length - 1);
};

export const seatsFoldedAtIndex = (
  state: HoldemStateType,
  idx: number,
): boolean[] => {
  if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;
  let folded: boolean[] = new Array<boolean>(state.seats.length).fill(false);
  state.actionList.slice(0, idx).forEach((value) => {
    if (value.action === 'fold') folded[value.seat] = true;
  });
  return folded;
};

export const seatsFolded = (state: HoldemStateType) => {
  return seatsFoldedAtIndex(state, state.actionList.length - 1);
};

export const seatsAllinAtIndex = (
  state: HoldemStateType,
  idx: number,
): boolean[] => {
  if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;
  let allin: boolean[] = new Array<boolean>(state.seats.length).fill(false);
  state.actionList.slice(0, idx).forEach((value) => {
    if ('isAllIn' in value && value.isAllIn) allin[value.seat] = true;
  });
  return allin;
};

export const seatsAllin = (state: HoldemStateType) => {
  return seatsAllinAtIndex(state, state.actionList.length - 1);
};

// None folded seats with
export const seatsWithActionAtIndex = (
  state: HoldemStateType,
  idx: number,
): number[] => {
  if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;

  let eligible = new Array(state.seats.length).fill(true);

  //everyone that has folded
  const seatsFolded = seatsFoldedAtIndex(state, idx);
  seatsFolded.forEach((value, index) => {
    if (value) eligible[index] = false;
  });

  //everyone that is already all in
  const seatsAllin = seatsAllinAtIndex(state, idx);
  seatsAllin.forEach((value, index) => {
    if (value) eligible[index] = false;
  });

  let seats: number[] = [];

  eligible.forEach((value, index) => {
    if (value) seats.push(index);
  });

  return seats;
};

export const seatsWithAction = (state: HoldemStateType) => {
  return seatsWithActionAtIndex(state, state.actionList.length - 1);
};

export const largestAggressiveAction = (
  actions: PlayerActionsType[],
): PlayerActionsType | 'none' => {
  let largestAggAction: PlayerActionsType | 'none' = 'none';
  actions.forEach((currAction, index) => {
    if (
      currAction.action === 'bet' ||
      currAction.action === 'blind' ||
      currAction.action === 'straddle'
    ) {
      largestAggAction = currAction;
      if (currAction.amount > largestAggAction.amount)
        largestAggAction = currAction;
    }
  });

  return largestAggAction;
};

export const seatsWhoActed = (actions: PlayerActionsType[]): number[] => {
  let seats: number[] = [];
  actions.forEach((action) => {
    if (!seats.includes(action.seat)) seats.push(action.seat);
  });
  return seats;
};

export type ActionRoundType = {
  round: PokerRoundsType;
  action: PlayerActionsType | 'none';
};

export const seatsLastActionAtIndex = (
  state: HoldemStateType,
  idx: number,
): ActionRoundType[] => {
  if (idx > state.actionList.length - 1) idx = state.actionList.length - 1;
  let round: PokerRoundsType = 'preflop';
  let lastActions: ActionRoundType[] = new Array(state.seats.length).fill({
    round: 'preflop',
    action: 'none',
  });
  for (let i = 0; i <= idx; i++) {
    const action = state.actionList[i];
    if (isPlayerAction(action)) lastActions[action.seat] = { round, action };
    else round = action.action;
  }
  return lastActions;
};

export const seatsLastAction = (state: HoldemStateType) => {
  return seatsLastActionAtIndex(state, state.actionList.length - 1);
};

export const getIndexForRound = (
  round: string | number,
  state: HoldemStateType,
) => {
  if (typeof round === 'number') round = numberToRound(round);

  return state.actionList.findIndex((ele) => {
    return isDealerAction(ele) && ele.action === round;
  });
};

export const seatsWithActionAtStartOfRound = (
  state: HoldemStateType,
  round: string | number,
): number[] => {
  if (typeof round === 'number') round = numberToRound(round);
  let idx = getIndexForRound(round, state);
  return seatsWithActionAtIndex(state, idx);
};

export const nextActionAtIndex = (
  state: HoldemStateType,
  idx: number,
): NextActionOptionType => {
  const round = whatRoundAtIndex(state, idx);
  let swa = seatsWithActionAtStartOfRound(state, round);
  const actionsThisRound = actionsByRoundAtIndex(state, idx)[round];
  const bettableStacks = bettableStackRemainingAtIndex(state, idx);
  const lastActs = seatsLastActionAtIndex(state, idx);

  // find the next seat who would go next
  actionsThisRound.forEach((action) => {
    if (isDealerAction(action)) {
      console.log(`!isPlayerAction(action)`);
      return;
    }
    if (swa[0] !== action.seat) throw new Error(`${swa[0]} !== ${action.seat}`);
    if (action.action === 'fold') swa.shift();
    else swa = cycleSeats(swa);
  });

  let seat = swa[0];
  //swa[0] *should* be the next action pending it hasnt already reacted to actions
  const aggAction = largestAggressiveAction(actionsThisRound);
  let actions: PlayerActionOptionType[] = [];

  //brand new hand
  if (idx === -1) {
    return { seat: 'dealer', action: 'preflop' };
  }
  //this means the round is closed out
  if (
    (aggAction === 'none' && lastActs[seat].round === round) ||
    (aggAction !== 'none' &&
      'seat' in aggAction &&
      aggAction.action === 'bet' &&
      aggAction.seat === seat)
  ) {
    return { seat: 'dealer', action: advanceRound(round) };
  }

  let maxStack = bettableStacks[round][seat];
  if (maxStack === 'unk') {
    maxStack = 999999;
  }

  if (aggAction === 'none') {
    actions.push({ action: 'check' });
    actions.push({ action: 'bet', min: 1, max: maxStack });
  } else {
    actions.push({ action: 'fold' });
    if ('amount' in aggAction) {
      let callAmount = aggAction.amount;
      if (callAmount > maxStack) {
        callAmount = maxStack;
        actions.push({ action: 'call', amount: callAmount, isAllIn: true });
      } else {
        actions.push({ action: 'call', amount: callAmount, isAllIn: false });
        actions.push({
          action: 'bet',
          max: maxStack,
          min: callAmount * 2 > maxStack ? maxStack : callAmount * 2,
        });
      }
    }
  }

  return { seat, actions };
};

printStateTable(preBuiltTestHandOne);

for (let i = 2; i < preBuiltTestHandOne.actionList.length; i++) {
  console.log(
    `Action At [${i}] = ${JSON.stringify(preBuiltTestHandOne.actionList[i])}`,
  );
  console.log(
    `Options[${i}] = ${JSON.stringify(nextActionAtIndex(preBuiltTestHandOne, i))}`,
  );
  console.log(`--------`);
}
