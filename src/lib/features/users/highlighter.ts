import logDebugMessage from '~lib/logs/debug';
import createFeature from '../feature';
import { Storage } from '@plasmohq/storage';
import { CSS_PREFIX } from '~constants';
import type { HighlighterSettings } from '~components/options/users';
import insertStyles from '~lib/insertStyles';

const storageKey = 'highlighter';

export async function removeUserFromHighlighter(userId) {
	const storage = new Storage();
	const settings: HighlighterSettings = await storage.get(storageKey);
	delete settings.users[userId];
	await storage.set(storageKey, settings);
}

export async function addUserToHighlighter(userId, backgroundColor, textColor) {
	const storage = new Storage();
	const settings: HighlighterSettings = await storage.get(storageKey);
	settings.users[userId] = {
		backgroundColor,
		textColor,
	};
	await storage.set(storageKey, settings);
}

export default createFeature(
	'highlighter',
	async () => {
		logDebugMessage('Feature Enabled: Highlighter');

		const storage = new Storage();
		const { users }: HighlighterSettings = await storage.get(storageKey);
		const rules = Object.keys(users).map(user => {
			const parsedUserId = user.replaceAll('+', ' ');
			const { backgroundColor, textColor } = users[user];
			const userRule = `.grid tr[data-user="${user}"] td, .grid tr[id*="${parsedUserId}"] td, .post[data-user="${user}"] .message-top, .msg-quote[data-user="${user}"] > p:first-of-type { background-color: ${backgroundColor} !important; color: ${textColor} } .grid tr[data-user="${user}"] a, .grid tr[id*="${parsedUserId}"] a, .post[data-user="${user}"] .message-top a, .post[data-user="${user}"] .message-top .user-icon, .msg-quote[data-user="${user}"] > p:first-of-type a { color: ${textColor} }`;
			return userRule;
		});
		insertStyles(`${CSS_PREFIX}highlighter`, rules.join(' '));
	},
);