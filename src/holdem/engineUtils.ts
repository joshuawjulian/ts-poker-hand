import {
	DealerActionType,
	PlayerActionType,
	PlayerIncreaseWagerType,
	PokerRoundType,
	PokerRounds,
	isDealerAction,
	isPlayerAction,
} from './action';
import { GameStateType } from './state';

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
export type StacksAtRoundType = Record<PokerRoundType, number[]>;

export let stacksAtStartOfRound = (state: GameStateType): StacksAtRoundType => {
	let startingStacks: (number | 'unknown')[] = [];
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
			if (round === 'preflop') {
				stacks[round][seat] -= largestWagers[round][seat];
				continue;
			}
			let prevRound = PokerRounds[idx - 1];
			let prev = stacks[prevRound][seat];
			stacks[round][seat] = prev - largestWagers[round][seat];
		}
	});
	return stacks;
};

// !TODO: if bet all in was made prior, and what the min bet actually is
// !TODO: handle multiple amounts for reopening action
export let minBet = (
	wagers: PlayerIncreaseWagerType[],
	reopenPercent: number = 1.0,
): number => {
	if (wagers.length === 0) return 0;
	if (wagers.length === 1) return wagers[0].amount * 2;
	let largest = wagers[wagers.length - 1].amount;
	let secondLargest = wagers[wagers.length - 2].amount;
	return (largest - secondLargest) * 2 + largest;
};
