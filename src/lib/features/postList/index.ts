import type { Feature } from '../feature';
import highlighter from '../users/highlighter';
import ignorator from '../users/ignorator';
import autoRedirect from './autoRedirect';
import autoScroll from './autoScroll';
import embedTwitter from './embedTwitter';
import filterMe from './filterMe';
import hideReplyArea from './hideReplyArea';
import markTopicCreator from './markTopicCreator';
import markdownButtons from './markdownButtons';
import nwsTopicImages from './nwsTopicImages';
import postNumbers from './postNumbers';
import resizableImages from './resizableImages';

const features: Feature[] = [
	nwsTopicImages,
	ignorator,
	highlighter,
	markTopicCreator,
	postNumbers,
	autoScroll,
	autoRedirect,
	filterMe,
	embedTwitter,
	markdownButtons,
	hideReplyArea,
	resizableImages,
];

export default features;