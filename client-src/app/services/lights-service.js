import socketsService from './sockets-service';

export default angular.module('sleeplight.services.lights-service', [
	socketsService.name,
])

	.factory('lightsService', function($http, socketsService) {

		let current = null;
		let states = [
			{ id: 'loading1', color: 'rgba(0,0,0,.7)' },
			{ id: 'loading2', color: 'rgba(0,0,0,.5)' },
			{ id: 'loading3', color: 'rgba(0,0,0,.3)' },
			{ id: 'loading4', color: 'rgba(0,0,0,.1)' },
		];

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
