import { z } from 'zod';
import { CardSchema } from './card';

// player actions first
export const PlayerActionsSchema = z.discriminatedUnion('action', [
	z.object({
		seat: z.number(),
		action: z.literal('fold'),
	}),
	z.object({
		seat: z.number(),
		action: z.literal('call'),
		amount: z.number(),
		isAllIn: z.boolean(),
	}),
	z.object({
		seat: z.number(),
		action: z.literal('bet'),
		amount: z.number(),
		isAllIn: z.boolean(),
	}),
	z.object({
		seat: z.number(),
		action: z.literal('check'),
	}),
	z.object({
		seat: z.number(),
		action: z.literal('blind'),
		amount: z.number(),
		isAllIn: z.boolean(),
	}),
]);

export const DealerActionSchema = z.discriminatedUnion('action', [
	z.object({
		action: z.literal('deal'),
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

export const ActionSchema = z.discriminatedUnion('action', [
	...PlayerActionsSchema.options,
	...DealerActionSchema.options,
]);

export type ActionType = z.infer<typeof ActionSchema>;

export const PlayerOptionSchema = z.discriminatedUnion('action', [
	z.object({
		seat: z.number(),
		action: z.literal('fold'),
	}),
	z.object({
		seat: z.number(),
		action: z.literal('call'),
		amount: z.number(),
		isAllIn: z.boolean(),
	}),
	z.object({
		seat: z.number(),
		action: z.literal('bet'),
		min: z.number(),
		max: z.number(),
		isAllIn: z.boolean(),
	}),
	z.object({
		seat: z.number(),
		action: z.literal('check'),
	}),
]);

export const DealerOptionSchema = z.discriminatedUnion('action', [
	z.object({
		action: z.literal('deal'),
	}),
	z.object({
		action: z.literal('flop'),
	}),
	z.object({
		action: z.literal('turn'),
	}),
	z.object({
		action: z.literal('river'),
	}),
	z.object({
		action: z.literal('showdown'),
	}),
]);

export const OptionSchema = z.discriminatedUnion('action', [
	...PlayerOptionSchema.options,
	...DealerOptionSchema.options,
]);

export const isPlayerAction = (
	action: ActionType,
): action is z.infer<typeof PlayerActionsSchema> => {
	return PlayerActionsSchema.safeParse(action).success;
};

export const isDealerAction = (
	action: ActionType,
): action is z.infer<typeof DealerActionSchema> => {
	return DealerActionSchema.safeParse(action).success;
};
