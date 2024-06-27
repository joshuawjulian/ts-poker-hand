import { NextOptionType, PlayerActionType } from './action';
import {
	getCurrentRound,
	getLargestWagerAmount,
	getMinMaxBet,
	getSeatOrder,
	getWagers,
	hasNonBlindAction,
	hasNonBlindStraddleAction,
	playerActionsCurrentRound,
	remainingStacks,
} from './engineUtils';
import { GameStateSchema, GameStateType } from './state';

// Attempt to work this through comments
export let next = (state: GameStateType): NextOptionType[] => {
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

	let seatOrder = getSeatOrder(state);
	let wagers = getWagers(state);
	let currSeat = seatOrder[0];
	let remainingStack = remainingStacks(state)[currSeat];
	let [minBet, maxBet] = getMinMaxBet(state);

	// early edge cases
	if (state.actionList.length === 1) {
		optionList.push({ action: 'blind', seat: currSeat });
		return optionList;
	}

	// Start compiling options
	// always have the option to fold
	optionList.push({ action: 'fold', seat: currSeat });

	// is checking an option? Only if the action hasnt been opened this round
	if (wagers.length === 0) {
		optionList.push({ action: 'check', seat: currSeat });
		optionList.push({
			action: 'bet',
			seat: currSeat,
			min: minBet,
			max: maxBet,
		});
	}

	if (wagers.length > 0) {
		let largestWager = getLargestWagerAmount(state);

		// call option
		if (remainingStack !== 'unknown' && largestWager >= remainingStack) {
			optionList.push({
				action: 'call',
				seat: currSeat,
				amount: remainingStack,
				isAllIn: true,
			});
		} else {
			optionList.push({
				action: 'call',
				seat: currSeat,
				amount: largestWager,
				isAllIn: false,
			});
		}

		// !TODO: reopen option
	}

	//blind/straddle edge case
	if (currentRound === 'preflop') {
		if (!hasNonBlindAction(state)) {
			optionList.push({ action: 'blind', seat: currSeat });
			optionList.push({ action: 'straddle', seat: currSeat });
		} else if (!hasNonBlindStraddleAction(state)) {
			optionList.push({ action: 'straddle', seat: currSeat });
		}
	}

	return optionList;
};
