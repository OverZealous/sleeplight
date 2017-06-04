import socketsService from './sockets-service';
import notificationService from './notification-service';

export default angular.module('sleeplight.services.schedule-service', [
	socketsService.name,
	notificationService.name,
])

	.factory('scheduleService', function($http, socketsService, notificationService, $q) {

		const data = {
			enabled: true,
			schedule: {},
			scheduleModel: {},
		};

		const loadDeferred = $q.defer();

		const updateData = (resp) => {
			angular.extend(data, resp.data);
			data.scheduleModel = {};
			data.days.forEach(d => {
				let events = data.scheduleModel[d] = {};
				data.events.forEach(event => {
					let eventDate = new Date();
					let tParts = data.schedule[d][event].split(':');
					eventDate.setHours(+tParts[0]);
					eventDate.setMinutes((+tParts[1]));
					eventDate.setSeconds(0);
					eventDate.setMilliseconds(0);
					events[event] = eventDate;
				});
			});
			return data;
		};

		$http.get('/api/schedule')
			.then(updateData)
			.then(loadDeferred.resolve)
			.catch((err) => {
				notificationService.error('Unable to load schedule', err);
				// TODO: handle loading errors better?
			});

		socketsService.on('scheduleEnabled', (enabled) => {
			data.enabled = enabled;
		});

		socketsService.on('schedule', (schedule) => {
			updateData({ data: { schedule } });
		});

		return {
			get loaded() { return loadDeferred.promise },
			get data() { return data },

			get enabled() { return data.enabled; },
			set enabled(enabledVal) {
				$http.post(`/api/schedule/${ enabledVal ? 'enable' : 'disable' }`)
					.then(updateData)
					.catch((resp) => {
						notificationService.error(`Unable to change ${enabledVal ? 'enable' : 'disable'} schedule`, resp);
					});
			},

			get scheduleModel() { return data.scheduleModel; },

			get schedule() { return data.schedule; },
			updateScheduleTime(day, event, newTime) {
				$http.post(`/api/schedule/${day}/${event}/${newTime}`)
					.then(updateData)
					.catch((resp) => {
						notificationService.error('Unable to update schedule', resp);
					});
			},
		}
	});
