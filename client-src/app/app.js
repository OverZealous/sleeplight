import '../styles/main.less';
import angular from 'angular';
import './utils/dev-tools';

import currentConfig from './components/current-config/current-config';

angular
	.module('sleeplight', [
		currentConfig.name,
	]);
