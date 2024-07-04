import { NextOptionType } from '../action';

export let optionArrayToString = (options: NextOptionType[]): string[] => {
	return options.reduce<string[]>(
		(acc, option) => [...acc, option.action],
		new Array<string>(),
	);
};
