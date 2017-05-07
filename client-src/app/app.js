import '../styles/main.less';
import angular from 'angular';
import './utils/dev-tools';

import testComp from './components/test/test.js';

angular
	.module('sleeplight', [
		testComp.name,
	]);
