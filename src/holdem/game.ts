import { s } from 'vitest/dist/reporters-5f784f42.js';
import {
  NextActionOptionType,
  PlayerActionsType,
  isPlayerAction,
} from './action.js';
import { getAllBlinds, nextAction, pushNext } from './engine.js';
import { HoldemStateType, setupBasicHoldemGame } from './state.js';
import {
  getRandBetween,
  getRandomCard,
  getRandomIndex,
  printStateTable,
} from './utils.js';

import readline from 'readline';
import fs from 'fs';

const isEnd = (nextAction: NextActionOptionType): boolean => {
  return 'action' in nextAction && nextAction.action === 'end';
};

export const createHand = (
  small: number,
  large: number,
  seats: number,
): HoldemStateType => {
  let state = setupBasicHoldemGame(seats, small, large);

  for (
    let nextActions: NextActionOptionType = nextAction(state);
    !isEnd(nextActions);
    nextActions = nextAction(state)
  ) {
    if ('action' in nextActions) {
      //is dealer action
      if (nextActions.action === 'flop') {
        pushNext(
          {
            action: 'flop',
            cards: [getRandomCard(), getRandomCard(), getRandomCard()],
          },
          state,
        );
      } else if (nextActions.action === 'turn') {
        pushNext({ action: 'turn', card: getRandomCard() }, state);
      } else if (nextActions.action === 'river') {
        pushNext({ action: 'river', card: getRandomCard() }, state);
      } else {
        pushNext({ action: 'end' }, state);
      }
    } else if (nextActions.actions.length > 0) {
      //is player action

      let nextAction =
        nextActions.actions[getRandomIndex(nextActions.actions.length)];
      let action: PlayerActionsType = {
        seat: nextActions.seat,
        action: 'fold',
      };

      if (nextAction.action === 'bet') {
        const amount = getRandBetween(nextAction.min, nextAction.max);
        action = {
          seat: nextActions.seat,
          action: nextAction.action,
          amount: amount,
          isAllIn: amount === nextAction.max,
        };
      } else if (nextAction.action === 'call') {
        action = {
          seat: nextActions.seat,
          action: nextAction.action,
          amount: nextAction.amount,
          isAllIn: nextAction.isAllIn,
        };
      } else if (
        nextAction.action === 'fold' ||
        nextAction.action === 'check'
      ) {
        action = {
          seat: nextActions.seat,
          action: nextAction.action,
        };
      }
      try {
        pushNext(action, state);
      } catch (err) {
        console.error(err);
        console.error(`### ERRORED AT ###`);
        console.error(`Attempted -> ${action}`);
        console.error(`State -> ${JSON.stringify(state, null, 2)}`);
      }
    }
  }

  return state;
};

// !TODO: Implement the playHand function
export const playHand = (small: number, large: number, seats: number) => {
  let state = setupBasicHoldemGame(seats, small, large);
  for (
    let nextActions: NextActionOptionType = nextAction(state);
    !isEnd(nextActions);
    nextActions = nextAction(state)
  ) {
    if ('action' in nextActions) {
      if (nextActions.action === 'flop') {
        state = pushNext(
          {
            action: 'flop',
            cards: [getRandomCard(), getRandomCard(), getRandomCard()],
          },
          state,
        );
      } else if (nextActions.action === 'turn') {
        state = pushNext({ action: 'turn', card: getRandomCard() }, state);
      } else if (nextActions.action === 'river') {
        state = pushNext({ action: 'river', card: getRandomCard() }, state);
      } else {
        state = pushNext({ action: 'end' }, state);
      }
    } else {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      console.log('Action on: ', nextActions.seat);
      let actionList = nextActions.actions.reduce<string[]>((acc, action) => {
        if ('action' in action) acc.push(action.action);
        return acc;
      }, new Array<string>());
      console.log('Actions: ', actionList);
      rl.question(`Actions: ${actionList}`, (answer) => {
        if (!actionList.includes(answer)) {
          return;
        } else {
          console.log('You selected: ', answer);
        }
      });
    }
  }
};

const writeHandState = (state: HoldemStateType) => {
  let seats = state.seats.length;
  let blinds = getAllBlinds(state).reduce((acc, blind) => {
    return acc + '_' + blind;
  }, '');
  let folder = `./testHands/`;
  let fileName = `${folder}hand${blinds}_${seats}.json`;
  fs.writeFile(fileName, JSON.stringify(state), { mode: 'w+' }, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
};

const main = () => {
  let small = 1;
  let big = 2;
  let seats = 6;
  let state = createHand(small, big, seats);
  printStateTable(state);
};

main();
