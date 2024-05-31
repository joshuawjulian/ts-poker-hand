import {
	NextOptionType,
	PlayerActionType,
	PlayerIncreaseWagerType,
	increaseWagerAction,
} from './action';
import {
	cycleSeats,
	getSeatsAtThisRoundStart,
	playerActionsCurrentRound,
} from './engineUtils';
import { GameStateSchema, GameStateType, getCurrentRound } from './state';

// Attempt to work this through comments
export let nextImproved = (state: GameStateType): NextOptionType[] => {
	let optionList: NextOptionType[] = [];
	// Check state first
	const parse = GameStateSchema.safeParse(state);
	if (!parse.success) {
		throw parse.error.errors[0].message;
	}
	state = parse.data;

	// if the actionList is empty - return preflop only
	if (state.actionList.length === 0) {
		return [{ action: 'preflop' }];
	}

	// we know we have a good schema, good actionList and atleast one item in it.
	let lastAction = state.actionList[state.actionList.length - 1];
	if (lastAction.action === 'showdown') throw 'Game is over';

	// --- at this point we know we have atleast the start ---

	// get what round we are currently in
	let currentRound = getCurrentRound(state);

	// get the player actions this round
	let playerActions: PlayerActionType[] = playerActionsCurrentRound(state);

	let seatsOrder = getSeatsAtThisRoundStart(state);

	// walk through the player actions this round to
	// to confirm action, see if we need to remove a seat
	// and figure out what wagers (if any) have been made
	let wagers: PlayerIncreaseWagerType[] = [];
	for (let i = 0; i < playerActions.length; i++) {
		let action = playerActions[i];
		if (increaseWagerAction(action)) wagers.push(action);
		if (action.action === 'fold') {
			seatsOrder = seatsOrder.filter((seat) => seat !== action.seat);
			continue;
		}
		if ('isAllIn' in action && action.isAllIn) {
			seatsOrder = seatsOrder.filter((seat) => seat !== action.seat);
			continue;
		}
		seatsOrder = cycleSeats(seatsOrder);
	}

	return optionList;
};
