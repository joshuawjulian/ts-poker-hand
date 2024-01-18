import { NextActionOptionType, PlayerActionsType } from './action.js';
import { nextAction, pushNext } from './engine.js';
import { HoldemStateType, setupBasicHoldemGame } from './state.js';
import {
  getRandBetween,
  getRandomCard,
  getRandomIndex,
  printStateTable,
} from './utils.js';

const isEnd = (nextAction: NextActionOptionType): boolean => {
  return 'action' in nextAction && nextAction.action === 'end';
};

const createHand = (
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
    } else if ('actions' in nextActions && nextActions.actions.length > 0) {
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
      pushNext(action, state);
    }
  }

  return state;
};

printStateTable(createHand(1, 2, 7));
