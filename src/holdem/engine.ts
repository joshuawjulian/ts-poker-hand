import { getNextRoundOption, NextOptionType, PlayerActionType } from './action';
import {
	actionComplete,
	getCurrentRound,
	getLargestWager,
	getLargestWagerAmount,
	getMinMaxBet,
	getSeatOrder,
	getStacksAtStartOfCurrentRound,
	getWagers,
	hasNonBlindAction,
	hasNonBlindStraddleAction,
	playerActionsCurrentRound,
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

	// if the action is complete, we need to move to the next round
	if (actionComplete(state)) return [getNextRoundOption(currentRound)];

	// get the player actions this round
	let playerActions: PlayerActionType[] = playerActionsCurrentRound(state);

	let seatOrder = getSeatOrder(state);
	let wagers = getWagers(state);
	let currSeat = seatOrder[0];
	let stacksBehind = getStacksAtStartOfCurrentRound(state);
	//let remainingStacks = getRemainingStacks(state);
	let largestRemainingStackBehind = Math.max(
		...stacksBehind.filter((stack) => stack !== 'unknown'),
	);
	// all unknown stacks will be increased to the largest stack
	let adjustedRemainingStacksBehind: number[] = [];

	for (let i = 0; i < stacksBehind.length; i++) {
		let stack = stacksBehind[i];
		if (stack === 'unknown') {
			adjustedRemainingStacksBehind.push(largestRemainingStackBehind);
		} else {
			adjustedRemainingStacksBehind.push(stack);
		}
	}
	let remainingStackBehind: number = adjustedRemainingStacksBehind[currSeat];

	let [minBet, maxBet] = getMinMaxBet(state);

	// early edge cases
	if (state.actionList.length === 1) {
		optionList.push({ action: 'blind', seat: currSeat });
		return optionList;
	}

	// Start compiling options

	// Dealer Options first
	// Is the round complete?

	// always have the option to fold
	optionList.push({ action: 'fold', seat: currSeat });

	// --CHECK--
	// if action hasnt been opened yet
	if (wagers.length === 0) {
		optionList.push({ action: 'check', seat: currSeat });
	} else {
		// if preflop, and the largest blind/straddle hasnt been raise, they can check
		if (currentRound === 'preflop') {
			let lastWager = wagers[wagers.length - 1];
			if (lastWager.action === 'blind' || lastWager.action === 'straddle') {
				if (lastWager.seat === currSeat)
					optionList.push({ action: 'check', seat: currSeat });
			}
		}
	}

	// --CALL/BET--
	if (wagers.length === 0) {
		optionList.push({
			action: 'bet',
			seat: currSeat,
			min: minBet,
			max: maxBet,
		});
	}
	if (wagers.length > 0) {
		let largestWagerAction = getLargestWager(state);
		let largestWagerAmount = getLargestWagerAmount(state);

		// call option
		// Preflop edge case if you are the largest blind/straddle, you cant call your own blind/straddle
		// so we want to filter that out
		if (
			currentRound !== 'preflop' ||
			(largestWagerAction !== null && currSeat !== largestWagerAction.seat)
		) {
			if (largestWagerAmount >= remainingStackBehind) {
				optionList.push({
					action: 'call',
					seat: currSeat,
					amount: remainingStackBehind,
					isAllIn: true,
				});
			} else {
				optionList.push({
					action: 'call',
					seat: currSeat,
					amount: largestWagerAmount,
					isAllIn: false,
				});
			}
		}

		// reopen option
		// if the seat hasnt acted they can always raise
		// unless the bet infront of them is larger than there stack
		if (largestWagerAmount < remainingStackBehind) {
			let hasPlayerActed = playerActions.find((action) => {
				return (
					action.seat === currSeat &&
					action.action !== 'blind' &&
					action.action !== 'straddle'
				);
			});
			if (!hasPlayerActed) {
				optionList.push({
					action: 'bet',
					seat: currSeat,
					min: minBet,
					max: maxBet,
				});
			} else {
				// if the seat has acted, they can only raise
				// if the action was reopened after their most recent action
				let reopenPercent = state.options.reopenPercent;
				let seatActionIdx = playerActions.findLastIndex(
					(action) => 'seat' in action && action.seat === currSeat,
				);
				// if the players last action was call/bet there will
				// be an amount, otherwise its check and 0
				let smallBet =
					'amount' in playerActions[seatActionIdx]
						? playerActions[seatActionIdx].amount
						: 0;
				for (let i = seatActionIdx + 1; i < playerActions.length; i++) {
					let playerAction = playerActions[i];
					if (playerAction.action === 'bet') {
						let largeBet = playerAction.amount;
						if (largeBet > smallBet + reopenPercent * smallBet) {
							optionList.push({
								action: 'bet',
								seat: currSeat,
								min: minBet, // this might be wrong, but Jordan has me too tired to think through it
								max: maxBet,
							});
						}
					}
				}
			}
		}
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
