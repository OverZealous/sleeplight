import socketsService from './sockets-service';
import notificationService from './notification-service';

export default angular.module('sleeplight.services.parents-service', [
	socketsService.name,
	notificationService.name,
])

	.factory('parentsService', function($http, socketsService, notificationService) {

		let current = null;
		let parents = [
			{ id: 'loading1', color: 'rgba(0,0,0,.5)' },
			{ id: 'loading2', color: 'rgba(0,0,0,.3)' },
		];

		$http.get('/api/parents')
			.then(resp => {
				let data = resp.data;
				current = data.currentParent;
				parents = data.parents;
			});

		socketsService.on('parent', (parent) => {
			current = parent;
		});

		return {
			get current() {
				return current;
			},
			set current(parent) {
				$http.post('/api/parents/' + parent)
					.then(() => {
						current = parent;
					})
					.catch((resp) => {
						notificationService.error('Unable to update parent mode', resp);
					});
			},

			get parents() {
				return parents;
			},
		}
	});
