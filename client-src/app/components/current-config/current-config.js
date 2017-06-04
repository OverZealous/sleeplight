import './current-config.less';
import parentsService from '../../services/parents-service';
import lightsService from '../../services/lights-service';
import scheduleEditor from '../schedule-editor/schedule-editor';

export default angular
	.module('sleeplight.components.current-config', [
		parentsService.name,
		lightsService.name,
		scheduleEditor.name,
	])

	.component('currentConfig', {
		bindings: {},
		template: require('./current-config.tpl.html'),
		controller: 'CurrentConfigCtrl',
	})

	.controller('CurrentConfigCtrl', function /* @ngInject */ CurrentConfigCtrl(parentsService, lightsService) {
		const ctrl = this;

		ctrl.parents = parentsService;
		ctrl.lights = lightsService;
	})
