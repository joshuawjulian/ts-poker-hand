import { z } from 'zod';
import { ActionSchema } from './action';

export const GameStateSchema = z.object({
	actionList: ActionSchema.array(),
	players: z
		.object({
			stack: z.number(),
		})
		.array(),
});
