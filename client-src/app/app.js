import '../styles/main.less';
import angular from 'angular';

import testComp from './components/test/test.js';

angular
	.module('sleeplight', [
		testComp.name,
	]);
