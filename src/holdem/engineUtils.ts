import {
	DealerActionType,
	PlayerActionType,
	PlayerIncreaseWagerType,
	PokerRoundType,
	PokerRounds,
	increaseWagerAction,
	isDealerAction,
	isPlayerAction,
} from './action';
import { GameStateType, StackType } from './state';

export let playerActionsCurrentRound = (
	state: GameStateType,
): PlayerActionType[] => {
	let currentRound = getCurrentRound(state);
	let idxStart = getIndexOfRoundStart(state, currentRound);

	let playerActions: PlayerActionType[] = [];
	for (let i = idxStart; i < state.actionList.length; i++) {
		let currAction = state.actionList[i];
		if (!isDealerAction(currAction)) {
			playerActions.push(currAction);
		}
	}

	return playerActions;
};

export let getCurrentRound = (state: GameStateType): PokerRoundType => {
	let dealerActions = getAllDealerActions(state);
	if (dealerActions.length === 0) throw 'No dealer actions found';
	if (dealerActions[dealerActions.length - 1].action === 'showdown')
		throw 'Game is over';
	return dealerActions[dealerActions.length - 1].action as PokerRoundType;
};

export let getAllDealerActions = (state: GameStateType): DealerActionType[] => {
	let dealerActions: DealerActionType[] = [];
	for (let i = 0; i < state.actionList.length; i++) {
		let currAction = state.actionList[i];
		if (isDealerAction(currAction)) {
			dealerActions.push(currAction);
		}
	}
	if (dealerActions.length === 0) throw 'No dealer actions found';
	return dealerActions;
};

export let getIndexOfRoundStart = (
	state: GameStateType,
	round: PokerRoundType,
): number => {
	for (let i = state.actionList.length - 1; i >= 0; i--) {
		let currAction = state.actionList[i];
		if (isDealerAction(currAction) && currAction.action === round) {
			return i;
		}
	}
	return -1;
};

export let getSeatsAtThisRoundStart = (state: GameStateType): number[] => {
	let currentRound = getCurrentRound(state);
	return getSeatsAtRoundStart(state, currentRound);
};

export let getSeatsAtRoundStart = (
	state: GameStateType,
	round: PokerRoundType,
): number[] => {
	let seats: number[] = [...Array(state.players.length).keys()];
	let idxRoundStart = getIndexOfRoundStart(state, round);

	for (let i = idxRoundStart; i < state.actionList.length; i++) {
		let action = state.actionList[i];
		if (
			isPlayerAction(action) &&
			(action.action === 'fold' || ('isAllIn' in action && action.isAllIn))
		) {
			seats = seats.filter((seat) => seat !== action.seat);
		}
	}
	return seats;
};

export let cycleSeats = (seats: number[]): number[] => {
	if (seats.length > 1) return [...seats.slice(1), seats[0]];
	return seats;
};

export let findLargestBlind = (state: GameStateType): number => {
	return state.actionList.reduce((acc, curr) => {
		if (curr.action === 'blind' && curr.amount > acc) return curr.amount;
		return acc;
	}, 0);
};

// { PokerRound : [largest wager by seat index]}
export type LargestWagersType = Record<PokerRoundType, number[]>;

// This can be calls or allins just largest by seat per round
export let largestWagersByRound = (
	state: GameStateType,
): Record<PokerRoundType, number[]> => {
	let emptyWager = [...Array(state.players.length).keys()].map(() => 0);
	let wagers = {
		preflop: [...emptyWager],
		flop: [...emptyWager],
		turn: [...emptyWager],
		river: [...emptyWager],
	} as Record<PokerRoundType, number[]>;

	let currRound: PokerRoundType;
	state.actionList.forEach((action, idx) => {
		if (isDealerAction(action)) {
			currRound = action.action as PokerRoundType;
			return;
		}
		if (isPlayerAction(action)) {
			if (
				'amount' in action &&
				wagers[currRound][action.seat] < action.amount
			) {
				wagers[currRound][action.seat] = action.amount;
			}
		}
	});

	return wagers;
};

// { PokerRound : [remaining stack at start of round by type]}
export type StacksAtRoundType = Record<PokerRoundType, StackType[]>;

export let getStacksAtStartOfRound = (
	state: GameStateType,
): StacksAtRoundType => {
	let startingStacks: StackType[] = [];
	state.players.forEach((player) => {
		startingStacks.push(player.startingStack);
	});

	let stacks = {
		preflop: [...startingStacks],
		flop: [...startingStacks],
		turn: [...startingStacks],
		river: [...startingStacks],
	} as StacksAtRoundType;

	let largestWagers = largestWagersByRound(state);

	PokerRounds.forEach((round: PokerRoundType, idx) => {
		let numPlayers = state.players.length;
		for (let seat = 0; seat < numPlayers; seat++) {
			let currStack = stacks[round][seat];
			if (currStack !== 'unknown') {
				if (round === 'preflop') {
					stacks[round][seat] = currStack - largestWagers[round][seat];
					continue;
				}
				let prevRound = PokerRounds[idx - 1];
				let prev = stacks[prevRound][seat];
				if (prev !== 'unknown')
					stacks[round][seat] = prev - largestWagers[round][seat];
			}
		}
	});
	return stacks;
};

export let getStacksAtStartOfCurrentRound = (
	state: GameStateType,
): StackType[] => {
	return getStacksAtStartOfRound(state)[getCurrentRound(state)];
};

export let getStacks = (state: GameStateType): StackType[] => {
	let largestWagers = largestWagersByRound(state);
	let stacks: StackType[] = [];
	state.players.forEach((player) => {
		stacks.push(player.startingStack);
	});

	PokerRounds.forEach((round: PokerRoundType) => {
		let numPlayers = state.players.length;
		for (let seat = 0; seat < numPlayers; seat++) {
			let currStack = stacks[seat];
			if (currStack !== 'unknown')
				stacks[seat] = currStack - largestWagers[round][seat];
		}
	});
	return stacks;
};

// Returns seat order after last action
// only seats with action behind will be in the order
export let getSeatOrder = (state: GameStateType): number[] => {
	let playerActions: PlayerActionType[] = playerActionsCurrentRound(state);
	let seatsOrder = getSeatsAtThisRoundStart(state);
	for (let i = 0; i < playerActions.length; i++) {
		let action = playerActions[i];
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
	return seatsOrder;
};

// get all wagers for the current round (blinds/straddle/bets)
export let getWagers = (state: GameStateType): PlayerIncreaseWagerType[] => {
	let playerActions: PlayerActionType[] = playerActionsCurrentRound(state);
	let wagers: PlayerIncreaseWagerType[] = [];
	for (let i = 0; i < playerActions.length; i++) {
		let action = playerActions[i];
		if (increaseWagerAction(action)) wagers.push(action);
	}
	return wagers;
};

// returns an array where each seat index is the largest wager for this round
export let getLargestWagers = (state: GameStateType): number[] => {
	let largestWagers = [...Array(state.players.length).keys()].map(() => 0);
	let wagers: PlayerIncreaseWagerType[] = getWagers(state);
	wagers.forEach((wager) => {
		if (wager.amount > largestWagers[wager.seat]) {
			largestWagers[wager.seat] = wager.amount;
		}
	});
	return largestWagers;
};

export let getLargestWagerAmount = (state: GameStateType): number => {
	let wagers = getWagers(state);
	if (wagers.length === 0) return 0;
	return wagers.reduce((acc, curr) => {
		if (curr.amount > acc) return curr.amount;
		return acc;
	}, 0);
};

export let remainingStacks = (state: GameStateType): StackType[] => {
	let currRound = getCurrentRound(state);
	let stacksAtStart = getStacksAtStartOfRound(state)[currRound];
	let largestWager = getLargestWagers(state);

	let numPlayers = state.players.length;
	let remainingStacks = [...stacksAtStart];
	for (let seat = 0; seat < numPlayers; seat++) {
		let currStartStack = stacksAtStart[seat];
		if (currStartStack !== 'unknown')
			remainingStacks[seat] = currStartStack - largestWager[seat];
	}
	return remainingStacks;
};

// Get the min viable bet for the current seat
// disregarding if they actually have the stack to do it
export let getMinBet = (state: GameStateType): number => {
	let minBet = 0;
	let wagers = getWagers(state);
	let currSeat = getSeatOrder(state).at(0);
	if (currSeat === undefined) throw 'No seats found';
	let largestBlind = findLargestBlind(state);
	minBet = largestBlind;
	let reopenWagers: PlayerIncreaseWagerType[] = [];
	if (wagers.length > 1) {
		// figure which wagers reopened betting
		for (let i = 0; i < wagers.length; i++) {
			if (wagers[i].isAllIn) {
				// 2 or more previous reopen wagers this round
				if (reopenWagers.length > 1) {
					let largeBet = reopenWagers[reopenWagers.length - 1].amount;
					let smallBet = reopenWagers[reopenWagers.length - 2].amount;
					let wagerStep = largeBet - smallBet;
					if (wagers[i].amount >= largeBet + wagerStep) {
						reopenWagers.push(wagers[i]);
					}
				}
				// 1 open wagers this round
				if (reopenWagers.length === 1) {
					reopenWagers.push(wagers[i]);
				}
			} else {
				reopenWagers.push(wagers[i]);
			}
		}
	}
	if (wagers.length === 1) {
		reopenWagers.push(wagers[0]);
	}

	if (reopenWagers.length === 0) {
		minBet = largestBlind;
	}
	if (reopenWagers.length === 1) {
		minBet = reopenWagers[0].amount * 2;
	}
	if (reopenWagers.length > 1) {
		let largeBet = reopenWagers[reopenWagers.length - 1].amount;
		let smallBet = reopenWagers[reopenWagers.length - 2].amount;
		let wagerStep = largeBet - smallBet;
		minBet = largeBet + wagerStep;
	}
	return minBet;
};

export let getLargestStack = (state: GameStateType): number => {
	let stacks = getStacksAtStartOfCurrentRound(state);
	let largestStack = 0;
	for (let i = 0; i < stacks.length; i++) {
		let currStack = stacks[i];
		if (currStack !== 'unknown' && currStack > largestStack) {
			largestStack = currStack;
		}
	}
	return largestStack;
};

export let getMaxBet = (state: GameStateType): number => {
	let currSeat = getSeatOrder(state).at(0);
	if (currSeat === undefined) throw 'No seats found';

	let maxBet = remainingStacks(state).at(currSeat);
	if (maxBet === undefined) throw 'No stack found';

	if (maxBet === 'unknown') return getLargestStack(state);

	return maxBet;
};

/*
	Get the min and max bet for the player with the current action
*/
export let getMinMaxBet = (state: GameStateType): [number, number] => {
	return [getMinBet(state), getMaxBet(state)];
};

export let hasNonBlindAction = (state: GameStateType): boolean => {
	return state.actionList.filter((a) => a.action !== 'blind').length > 0;
};

export let hasNonBlindStraddleAction = (state: GameStateType): boolean => {
	return (
		state.actionList.filter(
			(a) => a.action !== 'blind' && a.action !== 'straddle',
		).length > 0
	);
};
