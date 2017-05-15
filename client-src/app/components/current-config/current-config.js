export default angular
	.module('sleeplight.components.current-config', [])

	.component('currentConfig', {
		bindings: {},
		template: require('./current-config.tpl.html'),
		controller: 'CurrentConfigCtrl',
	})

	.controller('CurrentConfigCtrl', function /* @ngInject */ CurrentConfigCtrl() {
		const ctrl = this;
	})
