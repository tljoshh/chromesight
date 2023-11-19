import logDebugMessage from '~lib/logs/debug';
import createFeature from '../feature';
import PhotoSwipeLightbox from 'photoswipe/src/js/lightbox/lightbox.js';
import PhotoSwipe from 'photoswipe/src/js/photoswipe.js';
import 'photoswipe/src/photoswipe.css';
import insertStyles from '~lib/insertStyles';
import { CSS_PREFIX } from '~constants';

export default createFeature(
	'imageGallery',
	async () => {
		logDebugMessage('Feature Enabled: Image Gallery');

		// Setup each media element for the lightbox viewer
		const elements = document.querySelectorAll('.message-contents > p img:not(.shrunk)');
		elements.forEach((element: HTMLImageElement, index) => {
			// Determine if we need to add a wrapper element to each media element
			let wrapper: HTMLElement;
			const hasWrapper = element.parentElement.tagName === 'A';
			if (hasWrapper) {
				wrapper = element.parentElement;
			}
			else {
				wrapper = document.createElement('a');
			}

			// Add Photoswipe data attributes for lightbox
			wrapper.dataset.pswpWidth = `${element.offsetWidth}`;
			wrapper.dataset.pswpHeight = `${element.offsetHeight}`;
			wrapper.dataset.pswpSrc = element.src;
			wrapper.classList.add('lightbox');

			// Insert wrapper element if media element doesn't already have one
			if (!hasWrapper) {
				element.parentNode.insertBefore(wrapper, element);
				wrapper.appendChild(element);
			}

			// console.log(`.message-contents img[src="${element.src}"].shrunk`);
			// const thumbnails = document.querySelectorAll(`.message-contents img[src="${element.src}"].shrunk`);
			// console.log(thumbnails);
			// thumbnails.forEach(thumbnail => {
			// 	thumbnail.addEventListener('click', () => lightbox.loadAndOpen(index));
			// });
		});

		const rules = `
		.pswp__image-tiles {
			display: flex;
			flex-direction: row;
			gap: 5px;
			padding: 5px;
			background: rgba(0,0,0,.5);
			backdrop-filter: blur(4px);
			overflow-x: auto;
			scroll-snap-type: x mandatory;
			scroll-behavior: smooth;
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
		}
		.pswp__tile {
			flex-shrink: 0;
			background-size: cover;
			background-position: center;
			width: 64px;
			height: 64px;
			cursor: pointer;
		}
		.pswp__tile:hover { 
			opacity: .75;
		}
		.pswp__tile--active {
			box-shadow: inset 0px 0px 0px 3px rgba(0,90,255,.8);
		}
		.pswp__tile--active:hover {
			opacity: 1;
		}`;
		insertStyles(`${CSS_PREFIX}lightbox`, rules);

		// Initialize lightbox
		const lightbox = new PhotoSwipeLightbox({
			gallery: '#messages',
			children: '.lightbox',
			pswpModule: PhotoSwipe,
			padding: { top: 20, bottom: 111, left: 20, right: 20 },
		});
		// Add images as tiles and click to navigate functionality
		lightbox.on('uiRegister', function() {
			lightbox.pswp.ui.registerElement({
				name: 'imageTiles',
				className: 'pswp__image-tiles',
				appendTo: 'root',
				onInit: (el, pswp) => {
					const tiles = [];
					let tile;
					let prevIndex = -1;

					for (let i = 0; i < pswp.getNumItems(); i++) {
						tile = document.createElement('div');
						tile.className = 'pswp__tile';
						tile.style.backgroundImage = `url(${pswp.options.dataSource.items[i].dataset.pswpSrc})`,
						tile.onclick = (e) => {
							pswp.goTo(tiles.indexOf(e.target));
						};
						el.appendChild(tile);
						tiles.push(tile);
					}

					pswp.on('change', () => {
						tiles[pswp.currIndex].scrollIntoView({ behavior: 'smooth', inline: 'center' });
						if (prevIndex >= 0) {
							tiles[prevIndex].classList.remove('pswp__tile--active');
						}
						tiles[pswp.currIndex].classList.add('pswp__tile--active');
						prevIndex = pswp.currIndex;
					});
				},
			});
		});
		lightbox.init();
	},
);