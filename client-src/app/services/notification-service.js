export default angular.module('sleeplight.services.notification-service', [])

	.factory('notificationService', function($window, $log) {
		return {
			error(msg, error = msg) {
				$log.error(error);
				$window.alert('ERROR: ' +  msg);
			},
			info(msg) {
				$window.alert(msg);
			},
		};
	});
