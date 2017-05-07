export default angular
	.module('sleeplight.components.test', [])

	.component('testComp', {
		bindings: {

		},
		template: require('./test.tpl.html'),
		controller: 'TestCompCtrl',
	})

	.controller('TestCompCtrl', function /* @ngInject */ TestCompCtrl() {
		const ctrl = this;
		ctrl.test = 'Hi There';
	})
