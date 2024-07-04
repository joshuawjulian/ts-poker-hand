import { z } from 'zod';
import { CardSchema } from './card';

export const PlayerFoldSchema = z.object({
	seat: z.number(),
	action: z.literal('fold'),
});
export type PlayerFoldType = z.infer<typeof PlayerFoldSchema>;
export const PlayerCallSchema = z.object({
	seat: z.number(),
	action: z.literal('call'),
	amount: z.number(),
	isAllIn: z.boolean(),
});
export type PlayerCallType = z.infer<typeof PlayerCallSchema>;
export const PlayerBetSchema = z.object({
	seat: z.number(),
	action: z.literal('bet'),
	amount: z.number(),
	isAllIn: z.boolean(),
});
export type PlayerBetType = z.infer<typeof PlayerBetSchema>;
export const PlayerCheckSchema = z.object({
	seat: z.number(),
	action: z.literal('check'),
});
export type PlayerCheckType = z.infer<typeof PlayerCheckSchema>;
export const PlayerBlindSchema = z.object({
	seat: z.number(),
	action: z.literal('blind'),
	amount: z.number(),
	isAllIn: z.boolean(),
});
export type PlayerBlindType = z.infer<typeof PlayerBlindSchema>;
export const PlayerStraddleSchema = z.object({
	seat: z.number(),
	action: z.literal('straddle'),
	amount: z.number(),
	isAllIn: z.boolean(),
});
export type PlayerStraddleType = z.infer<typeof PlayerStraddleSchema>;

export type PlayerIncreaseWagerType =
	| PlayerBetType
	| PlayerBlindType
	| PlayerStraddleType;

export const increaseWagerAction = (
	action: ActionType,
): action is PlayerIncreaseWagerType => {
	return (
		action.action === 'bet' ||
		action.action === 'blind' ||
		action.action === 'straddle'
	);
};

// player actions first
export const PlayerActionsSchema = z.discriminatedUnion('action', [
	PlayerBetSchema,
	PlayerBlindSchema,
	PlayerCallSchema,
	PlayerCheckSchema,
	PlayerFoldSchema,
	PlayerStraddleSchema,
]);

// These increase the bet size AND give action after being called
export const PlayerBlindActions = ['blind', 'straddle'] as const;

// These attempt to close the action
export const PlayerCloseActions = ['check', 'call', 'fold'] as const;

export const DealerActionSchema = z.discriminatedUnion('action', [
	z.object({
		action: z.literal('preflop'),
	}),
	z.object({
		action: z.literal('flop'),
		flop: z.array(CardSchema).length(3),
	}),
	z.object({
		action: z.literal('turn'),
		turn: CardSchema,
	}),
	z.object({
		action: z.literal('river'),
		river: CardSchema,
	}),
	z.object({
		action: z.literal('showdown'),
	}),
]);

export type PlayerActionType = z.infer<typeof PlayerActionsSchema>;
export type DealerActionType = z.infer<typeof DealerActionSchema>;

export const ActionSchema = z.discriminatedUnion('action', [
	...PlayerActionsSchema.options,
	...DealerActionSchema.options,
]);

export type ActionType = z.infer<typeof ActionSchema>;

export const PlayerOptionFoldSchema = z.object({
	seat: z.number(),
	action: z.literal('fold'),
});
export type PlayerOptionFoldType = z.infer<typeof PlayerOptionFoldSchema>;

export let PlayerOptionBlindSchema = z.object({
	seat: z.number(),
	action: z.literal('blind'),
});
export type PlayerOptionBlindType = z.infer<typeof PlayerOptionBlindSchema>;

export let PlayerOptionStraddleSchema = z.object({
	seat: z.number(),
	action: z.literal('straddle'),
});
export type PlayerOptionStraddleType = z.infer<
	typeof PlayerOptionStraddleSchema
>;

export const PlayerOptionCallSchema = z.object({
	seat: z.number(),
	action: z.literal('call'),
	amount: z.number(),
	isAllIn: z.boolean(),
});
export type PlayerOptionCallType = z.infer<typeof PlayerOptionCallSchema>;
export const PlayerOptionBetSchema = z.object({
	seat: z.number(),
	action: z.literal('bet'),
	min: z.union([z.number().min(0), z.literal('unknown')]),
	max: z.union([z.number().min(0), z.literal('unknown')]),
});
export type PlayerOptionBetType = z.infer<typeof PlayerOptionBetSchema>;
export const PlayerOptionCheckSchema = z.object({
	seat: z.number(),
	action: z.literal('check'),
});
export type PlayerOptionCheckType = z.infer<typeof PlayerOptionCheckSchema>;

export const PlayerOptionSchema = z.discriminatedUnion('action', [
	PlayerOptionFoldSchema,
	PlayerOptionCallSchema,
	PlayerOptionBetSchema,
	PlayerOptionCheckSchema,
	PlayerOptionBlindSchema,
	PlayerOptionStraddleSchema,
]);

export type PlayerOptionType = z.infer<typeof PlayerOptionSchema>;

export const DealerOptionSchema = z.discriminatedUnion('action', [
	z.object({
		action: z.literal('preflop'),
	}),
	z.object({
		action: z.literal('flop'),
		cards: z.literal(3),
	}),
	z.object({
		action: z.literal('turn'),
		cards: z.literal(1),
	}),
	z.object({
		action: z.literal('river'),
		cards: z.literal(1),
	}),
	z.object({
		action: z.literal('showdown'),
	}),
]);

export const PokerRounds = ['preflop', 'flop', 'turn', 'river'] as const;

export type PokerRoundType = (typeof PokerRounds)[number];

export type DealerOptionType = z.infer<typeof DealerOptionSchema>;

export const NextOptionSchema = z.discriminatedUnion('action', [
	...PlayerOptionSchema.options,
	...DealerOptionSchema.options,
]);

export type NextOptionType = z.infer<typeof NextOptionSchema>;

export const isPlayerAction = (
	action: ActionType,
): action is PlayerActionType => {
	return PlayerActionsSchema.safeParse(action).success;
};

export const isDealerAction = (
	action: ActionType,
): action is DealerActionType => {
	return DealerActionSchema.safeParse(action).success;
};

export let isPlayerOption = (
	option: NextOptionType,
): option is PlayerOptionType => {
	return PlayerOptionSchema.safeParse(option).success;
};

export let isPlayerOptions = (
	options: NextOptionType[],
): options is PlayerOptionType[] => {
	return z.array(PlayerOptionSchema).safeParse(options).success;
};

export let isDealerOption = (
	option: NextOptionType,
): option is DealerOptionType => {
	return DealerOptionSchema.safeParse(option).success;
};

export let isDealerOptions = (
	options: NextOptionType[],
): options is DealerOptionType[] => {
	return z.array(DealerOptionSchema).safeParse(options).success;
};

export let getNextRoundOption = (round: PokerRoundType): DealerOptionType => {
	if (round === 'preflop') {
		return { action: 'flop', cards: 3 };
	} else if (round === 'flop') {
		return { action: 'turn', cards: 1 };
	} else if (round === 'turn') {
		return { action: 'river', cards: 1 };
	} else {
		return { action: 'showdown' };
	}
};
