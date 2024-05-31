import { NextOptionType } from './action';
import { next } from './engine';
import { GameStateSchema, GameStateType } from './state';

import readline from 'node:readline';
import { ZodSchema, z } from 'zod';
import { CardRankSchema, CardSuitSchema } from './card';

export let sixHandedSimple: GameStateType = GameStateSchema.parse({
	players: [
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
		{
			startingStack: 100,
			cards: [
				{ rank: 'X', suit: 'x' },
				{ rank: 'X', suit: 'x' },
			],
		},
	],
	actionList: [],
});

export let cardsToString = (cards: { rank: string; suit: string }) => {
	return `${cards.rank}${cards.suit}`;
};

export let displaySeats = (state: GameStateType) => {
	let playerTable: {
		seat: number;
		stack: number | 'unknown';
		cards: string;
	}[] = [];
	state.players.forEach((player, index) => {
		let cards = player.cards.map(cardsToString).join('');
		playerTable.push({
			seat: index,
			stack: player.startingStack,
			cards: cards,
		});
	});
	console.table(playerTable, ['seat', 'stack', 'cards']);
};

export let displayOptions = (options: NextOptionType[]) => {
	options.forEach((option, index) => {
		let str = `[${index}]: ${option.action}`;
		if ('min' in option) {
			str += ` min:${option.min}`;
		}
		if ('max' in option) {
			str += ` max:${option.max}`;
		}
		if ('amount' in option) {
			str += ` amount:${option.amount}`;
		}
		if ('isAllIn' in option) {
			str += ` isAllIn:${option.isAllIn}`;
		}
		console.log(str);
	});
};

export let displayActionList = (state: GameStateType) => {
	let actionTable: {
		seat: number | 'dealer';
		action: string;
		amount: number;
		isAllIn: boolean | undefined;
	}[] = [];
	state.actionList.forEach((action, index) => {
		let amount = 0;
		if ('amount' in action) {
			amount = action.amount;
		}
		let seat: number | 'dealer' = 'dealer';
		if ('seat' in action) {
			seat = action.seat;
		}
		let isAllIn = undefined;
		if ('isAllIn' in action) {
			isAllIn = action.isAllIn;
		}
		actionTable.push({
			seat,
			action: action.action,
			amount,
			isAllIn,
		});
	});
	console.table(actionTable, ['seat', 'action', 'amount', 'isAllIn']);
};

export let getInput = async (prompt: string, schema: ZodSchema) => {
	process.stdout.write(prompt);

	let rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	for await (const line of rl) {
		let parsed = schema.safeParse(line);
		if (parsed.success) {
			rl.close();
			return parsed.data;
		}
		console.error(parsed.error.errors[0].message);
		process.stdout.write(prompt);
	}
};

export let getCardInput = async () => {
	let rank = await getInput('Enter rank: ', CardRankSchema);
	let suit = await getInput('Enter suit: ', CardSuitSchema);
	return { rank, suit };
};

let state = sixHandedSimple;

while (true) {
	let options = next(state);
	displaySeats(state);
	displayActionList(state);
	displayOptions(options);

	let option = await getInput(
		'Choose an option: ',
		z.coerce
			.number()
			.min(0)
			.max(options.length - 1),
	);

	let act = options[option];
	if (act.action === 'fold' || act.action === 'check') {
		state.actionList.push({ action: act.action, seat: act.seat });
	} else if (act.action === 'call') {
		state.actionList.push({
			action: act.action,
			seat: act.seat,
			amount: act.amount,
			isAllIn: act.isAllIn,
		});
	} else if (act.action === 'bet') {
		let betSchema = z.coerce.number();
		if (act.min !== 'unknown' && act.max !== 'unknown')
			betSchema = betSchema.min(act.min).max(act.max);
		let betSize = await getInput(
			`Bet Amount (${act.min}-${act.max}) `,
			betSchema,
		);
		state.actionList.push({
			action: act.action,
			seat: act.seat,
			amount: betSize,
			isAllIn: betSize === act.max,
		});
	} else if (act.action === 'preflop') {
		state.actionList.push({ action: act.action });
	} else if (act.action === 'flop') {
		let flop = [];
		for (let i = 0; i < 3; i++) {
			flop.push(await getCardInput());
		}
		state.actionList.push({ action: act.action, flop });
	} else if (act.action === 'turn') {
		let card = await getCardInput();
		state.actionList.push({ action: act.action, turn: card });
	} else if (act.action === 'river') {
		let card = await getCardInput();
		state.actionList.push({ action: act.action, river: card });
	}
}
