import { z } from 'zod';
import { ActionsSchema } from './action.js';

export const POKER_ROUNDS = ['preflop', 'flop', 'turn', 'river', 'end'];
export type PokerRoundsType = 'preflop' | 'flop' | 'turn' | 'river' | 'end';

export const SeatSchema = z.object({
	startingStack: z.union([z.number().positive(), z.literal('unk')]),
});

export type SeatType = z.infer<typeof SeatSchema>;

export const HoldemStateSchema = z.object({
	seats: SeatSchema.array(),
	preflopOrder: z.number().array().optional(),
	actionList: ActionsSchema.array(),
});

export type HoldemStateType = z.infer<typeof HoldemStateSchema>;

export const numberOfPlayers = (state: HoldemStateType) => {
	return state.seats.length;
};

export const setupBasicHoldemGame = (
	numberPlayers: number,
	smallBlind: number,
	bigBlind: number,
): HoldemStateType => {
	let seats: SeatType[] = [];
	for (let i = 0; i < numberPlayers; i++) {
		seats.push({ startingStack: bigBlind * 100 });
	}
	return {
		seats,
		actionList: [
			{ action: 'preflop' },
			{ action: 'blind', seat: 0, amount: smallBlind, isAllIn: false },
			{ action: 'blind', seat: 1, amount: bigBlind, isAllIn: false },
		],
	};
};
