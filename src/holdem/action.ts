import { z } from 'zod';
import { CardSchema } from './card.js';

/*
  player actions - fold, check, bet, call
	seats 
*/

export const CallActionSchema = z.object({
  action: z.literal('call'),
  amount: z.number(),
  isAllIn: z.boolean(),
  seat: z.number(),
});

export const FoldActionSchema = z.object({
  action: z.literal('fold'),
  seat: z.number(),
});

export const CheckActionSchema = z.object({
  action: z.literal('check'),
  seat: z.number(),
});

export const BetActionSchema = z.object({
  action: z.literal('bet'),
  amount: z.number(),
  isAllIn: z.boolean(),
  seat: z.number(),
});

export const BlindActionSchema = z.object({
  action: z.literal('blind'),
  amount: z.number(),
  isAllIn: z.boolean(),
  seat: z.number(),
});

export const StraddleActionSchema = z.object({
  action: z.literal('straddle'),
  amount: z.number(),
  isAllIn: z.boolean(),
  seat: z.number(),
});

export const AnteActionSchema = z.object({
  action: z.literal('ante'),
  amount: z.number(),
  isAllIn: z.boolean(),
  seat: z.number(),
});

export const PlayerActionsSchema = z.discriminatedUnion('action', [
  CallActionSchema,
  FoldActionSchema,
  CheckActionSchema,
  BetActionSchema,
  BlindActionSchema,
  StraddleActionSchema,
  AnteActionSchema,
]);

export type PlayerActionsType = z.infer<typeof PlayerActionsSchema>;

export const PreflopActionSchema = z.object({
  action: z.literal('preflop'),
});

export type PreflopActionType = z.infer<typeof PreflopActionSchema>;

export const FlopActionSchema = z.object({
  action: z.literal('flop'),
  cards: CardSchema.array().length(3),
});

export const TurnActionSchema = z.object({
  action: z.literal('turn'),
  card: CardSchema,
});

export const RiverActionSchema = z.object({
  action: z.literal('river'),
  card: CardSchema,
});

export const EndActionSchema = z.object({
  action: z.literal('end'),
});

export const DealerActionsSchema = z.discriminatedUnion('action', [
  PreflopActionSchema,
  FlopActionSchema,
  TurnActionSchema,
  RiverActionSchema,
  EndActionSchema,
]);

export type DealerActionType = z.infer<typeof DealerActionsSchema>;

export const ActionsSchema = z.discriminatedUnion('action', [
  CallActionSchema,
  FoldActionSchema,
  CheckActionSchema,
  BetActionSchema,
  BlindActionSchema,
  StraddleActionSchema,
  AnteActionSchema,
  PreflopActionSchema,
  FlopActionSchema,
  TurnActionSchema,
  RiverActionSchema,
  EndActionSchema,
]);

export type ActionsType = z.infer<typeof ActionsSchema>;

export const DEALER_ACTIONS_LIST = [
  'preflop',
  'flop',
  'turn',
  'river',
  'end',
] as const;

export const PLAYER_ACTIONS_LIST = [
  'call',
  'fold',
  'bet',
  'check',
  'blind',
  'straddle',
  'ante',
] as const;

export const isPlayerAction = (
  action: ActionsType,
): action is PlayerActionsType => {
  return 'seat' in action;
};

export const isDealerAction = (
  action: ActionsType,
): action is DealerActionType => {
  return !isPlayerAction(action);
};

export type CallActionOptionType = {
  action: 'call';
  amount: number;
  isAllIn: boolean;
};

export type FoldActionOptionType = {
  action: 'fold';
};

export const FoldActionOption = {
  action: 'fold',
} as const;

export type CheckActionOptionType = {
  action: 'check';
};

export const CheckActionOption = {
  action: 'check',
} as const;

export type BetActionOptionType = {
  action: 'bet';
  min: number;
  max: number;
};

export type PlayerActionOptionType =
  | CallActionOptionType
  | FoldActionOptionType
  | CheckActionOptionType
  | BetActionOptionType;

export const betActionOption = (
  min: number,
  max: number,
): BetActionOptionType => {
  return {
    action: 'bet',
    min,
    max,
  } as const;
};

export type PlayerNextActionOptionType = {
  seat: number;
  actions: PlayerActionOptionType[];
};

export type DealerNextActionOptionType = {
  seat: 'dealer';
  action: (typeof DEALER_ACTIONS_LIST)[number];
};

export type NextActionOptionType =
  | PlayerNextActionOptionType
  | DealerNextActionOptionType;
