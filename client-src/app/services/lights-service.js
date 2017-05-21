import socketsService from './sockets-service';

export default angular.module('sleeplight.services.lights-service', [
	socketsService.name,
])

	.factory('lightsService', function($http, socketsService) {

		let current = null;
		let states = [];

		$http.get('/api/lights')
			.then(resp => {
				let data = resp.data;
				current = data.currentState;
				states = data.lightStates;
			});

		socketsService.on('light', (state) => {
			current = state;
		});

		return {
			get current() {
				return current;
			},
			set current(state) {
				$http.post('/api/lights/' + state)
					.then(() => {
						current = state;
					})
					.catch(() => {
						// TODO: alert to an error
					});
			},

			get states() {
				return states;
			},
		}
	});
