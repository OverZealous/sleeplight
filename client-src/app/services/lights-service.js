import socketsService from './sockets-service';
import notificationService from './notification-service';

export default angular.module('sleeplight.services.lights-service', [
	socketsService.name,
	notificationService.name,
])

	.factory('lightsService', function($http, socketsService, notificationService) {

		let current = null;
		let states = [
			{ id: 'loading1', color: 'rgba(0,0,0,.7)' },
			{ id: 'loading2', color: 'rgba(0,0,0,.5)' },
			{ id: 'loading3', color: 'rgba(0,0,0,.3)' },
			{ id: 'loading4', color: 'rgba(0,0,0,.1)' },
		];
		let stateMap = {};

		$http.get('/api/lights')
			.then(resp => {
				let data = resp.data;
				current = data.currentState;
				states = data.lightStates;
				states.forEach(s => stateMap[s.id] = s);
			});

		socketsService.on('light', (state) => {
			current = state;
		});

		return {
			get states() { return states },
			get stateMap() { return stateMap },

			get current() { return current },
			set current(state) {
				$http.post('/api/lights/' + state)
					.then(() => {
						current = state;
					})
					.catch((resp) => {
						notificationService.error('Unable to update mode', resp);
					});
			},
		}
	});
