import logDebugMessage from '~lib/logs/debug';
import createFeature from '../feature';
import { Storage } from '@plasmohq/storage';
import type { IgnoratorSettings } from '~components/options/users';
import { CSS_PREFIX } from '~constants';
import insertStyles, { type styleId } from '~lib/insertStyles';

const storageKey = 'ignorator';
const stylesId: styleId = `${CSS_PREFIX}ignorator`;

export async function removeUserFromIgnorator(userId: string) {
	const storage = new Storage();
	const ignoratorSettings:IgnoratorSettings = await storage.get(storageKey);
	delete ignoratorSettings.users[userId];
	await storage.set(storageKey, ignoratorSettings);
}

export async function addUserToIgnorator(userId: string) {
	if (userId !== 'tiko') {
		const storage = new Storage();
		const ignoratorSettings:IgnoratorSettings = await storage.get(storageKey);
		ignoratorSettings.users[userId] = {
			hideTopics: true,
			hidePosts: true,
		};
		await storage.set(storageKey, ignoratorSettings);
		return true;
	}
	else {
		alert('You can\'t ignorate Tiko.');
		return false;
	}
}

async function confirmIgnoratorAddition(e) {
	e.preventDefault();

	const post = e.target.closest('.post');
	const userId = post.dataset.user;

	if (post.dataset.user !== 'tiko') {
		if (confirm('Are you sure you want to ignorate this user?')) {
			const ignorated = await addUserToIgnorator(userId);
			if (ignorated) {
				// We only target posts, since this function is only ever triggered from the message list
				const styles = document.querySelector(`#${stylesId}`);
				styles.innerHTML = `${styles.innerHTML}\n${`.post[data-user="${userId}"]`} { display: none; }`;
			}
		}
	}
	else {
		alert('You can\'t ignorate Tiko');
	}
}

function addIgnoratorLink(post: HTMLElement) {
	const header = post.querySelector('.message-top');

	const link = document.createElement('a');
	link.href = '#';
	link.innerText = 'Ignorate User';
	link.addEventListener('click', confirmIgnoratorAddition);

	const wrapper = document.createElement('span');
	wrapper.insertAdjacentText('beforeend', ' | ');
	wrapper.insertAdjacentElement('beforeend', link);
	header.insertAdjacentElement('beforeend', wrapper);
}

export default createFeature(
	'ignorator',
	async () => {
		logDebugMessage('Feature Enabled: Ignorator');

		const storage = new Storage();
		const { users }:IgnoratorSettings = await storage.get(storageKey);

		// Create CSS rule to hide all posts, threads, and any notices from ignorated users
		const selectors = Object.keys(users).map((user) => {
			const selector = [];

			if (users[user].hideTopics && (window.location.pathname.includes('/threads/') || window.location.pathname.includes('/'))) {
				selector.push(`.grid tr[data-user="${user}"]`);
			}

			if (users[user].hidePosts && window.location.pathname.includes('/thread/')) {
				selector.push(`.post[data-user="${user}"], .message-contents blockquote[data-user="${user}"]`);
			}

			if (window.location.pathname.includes('/notices/')) {
				selector.push(`.grid tr[id*="${user}"]`);
			}

			return selector.join(',');
		}).filter(selector => selector !== '');

		const rules = `${selectors.join(',')} { display: none }`;
		insertStyles(stylesId, rules);

		// Add a link to ignorate a user to all posts
		const posts = document.querySelectorAll('.post');
		for (const post of posts) {
			addIgnoratorLink(post as HTMLElement);
		}
	},
	async (addedNode) => {
		addIgnoratorLink(addedNode as HTMLElement);
	},
);