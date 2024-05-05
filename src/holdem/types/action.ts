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
