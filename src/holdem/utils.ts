import { HoldemStateType, PokerRoundsType } from './state.js';

import { Console } from 'console';
import { Transform } from 'node:stream';
import { ActionsType, isPlayerAction } from './action.js';

const ts = new Transform({
  transform(chunk, _, cb) {
    cb(null, chunk);
  },
});
const logger = new Console({ stdout: ts });

function getTable(data: any) {
  logger.table(data);
  const table = (ts.read() || '').toString();
  console.log(table);
}
console.table = getTable;

export const isNumber = (value: any): value is number => {
  return typeof value === 'number';
};

export const printStateTable = (state: HoldemStateType) => {
  let seats: string[] = [];
  let printActions: { [index: string]: string }[] = [];
  for (let i = 0; i < state.seats.length; i++) {
    seats.push(i + '');
  }
  for (let i = 0; i < state.actionList.length; i++) {
    let blankAction: { [index: string]: string } = {};

    const action = state.actionList[i];
    if (isPlayerAction(action)) {
      blankAction[action.seat] = action.action;
      if ('amount' in action)
        blankAction[action.seat] =
          blankAction[action.seat] + '(' + action.amount + ')';
    } else {
      for (let i = 0; i < state.seats.length; i++)
        blankAction[i + ''] = `${action.action}`;
    }
    printActions.push(blankAction);
  }
  console.table(printActions);
};

export const numberToRound = (roundNumber: number): PokerRoundsType => {
  switch (roundNumber) {
    case 0:
      return 'preflop';
    case 1:
      return 'flop';
    case 2:
      return 'turn';
    case 3:
      return 'river';
    default:
      return 'end';
  }
};

export const roundToNumber = (roundStr: PokerRoundsType) => {
  switch (roundStr) {
    case 'preflop':
      return 0;
    case 'flop':
      return 1;
    case 'turn':
      return 2;
    case 'river':
      return 3;
    default:
      return 4;
  }
};

export const cycleSeats = (seats: number[]): number[] => {
  if (seats.length < 2) return seats;
  let temp = seats.shift();
  if (temp) seats.push(temp);
  return seats;
};

export const actionListSingleLine = (list: ActionsType[]): string => {
  let str = '';
  list.forEach((action, index) => {
    str += `[${index}]`;
    if (isPlayerAction(action)) {
      str += ` Seat ${action.seat} => ${action.action}`;
      if ('amount' in action) {
        str += `(${action.amount})`;
      }
    } else {
      str += `Round-${action.action}`;
    }
    str += ' | ';
  });
  return str;
};

export const arrayDiff = (arrA: number[], arrB: number[]): number[] => {
  let diffArr: number[] = [];
  arrA.forEach((value) => {
    if (!arrB.includes(value)) diffArr.push(value);
  });
  arrB.forEach((value) => {
    if (!arrA.includes(value)) diffArr.push(value);
  });

  return [...new Set(diffArr)];
};
