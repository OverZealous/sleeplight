export default angular.module('sleeplight.services.sockets-service', [])

	.factory('socketsService', function($window, $rootScope) {
		if(!$window.io) {
			throw new Error('No socket library!');
		}

		const socket = $window.io();

		return {
			on(event, cb) {
				socket.on(event, (...args) => {
					$rootScope.$apply(() => cb(...args));
				});
			},
		};
	});
