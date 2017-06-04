import './schedule-editor.less';
import scheduleService from '../../services/schedule-service';
import lightsService from '../../services/lights-service';
import notificationsService from '../../services/notification-service';

export default angular
	.module('sleeplight.components.schedule-editor', [
		scheduleService.name,
		lightsService.name,
		notificationsService.name,
	])

	.component('scheduleEditor', {
		bindings: {},
		template: require('./schedule-editor.tpl.html'),
		controller: 'ScheduleEditorCtrl',
	})

	.controller('ScheduleEditorCtrl', function /* @ngInject */ ScheduleEditorCtrl(scheduleService, lightsService, notificationService) {
		const ctrl = this;

		ctrl.colorFor = (event) => {
			const eventLight = ctrl.data.eventLights[event];
			return lightsService.stateMap[eventLight].color;
		};

		const d = new Date().getDay();
		ctrl.currentDay = (d === 0 || d === 1) ? 'weekends' : 'weekdays';

		Object.defineProperties(ctrl, {
			schedule: { get() { return scheduleService.scheduleModel } },
			enabled: {
				get() { return scheduleService.enabled },
				set(newVal) { scheduleService.enabled = newVal },
			},
			data: { get() { return scheduleService.data } },
		});

		const addZero = n => n < 10 ? '0' + n : '' + n;
		ctrl.updateEvent = (event) => {
			const time = scheduleService.scheduleModel[ctrl.currentDay][event];
			if(!time) {
				notificationService.error('Invalid Time');
				return;
			}
			const newTime = addZero(time.getHours()) + ':' + addZero(time.getMinutes());
			scheduleService.updateScheduleTime(ctrl.currentDay, event, newTime);
		};
	})

	.directive('simpleTimeDisplay', /* @ngInject */ function() {
		return {
			require: 'ngModel',
			link(scope, elem, attr, ngModelCtrl) {
				ngModelCtrl.$formatters.unshift((v) => {
					if(typeof v === 'string' && v) {
						v = v.replace(/^(\d\d?):(\d\d)(:\d\d)?(\.\d+)?$/, '$1:$2');
					}
					return v;
				});
				ngModelCtrl.$parsers.unshift((v) => {
					if(typeof v === 'string' && v) {
						v = v + ':00.000';
					}
					return v;
				});
			},
		};
	})
