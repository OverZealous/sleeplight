let $injector;
const Dev = {
		find(service) {
			if(!$injector) {
				['[ng-app]', 'body', '[ui-view]'].forEach(function(sel) {
					$injector = $injector || angular.element(document.querySelector(sel)).injector();
				});
			}
			return $injector.get(service);
		},
		$apply(fn) {
			return Dev.$rootScope.$apply(fn);
		},
		changeUrl(url) {
			Dev.$apply(() => Dev.$location.url(url));
		},
		$httpGet() {
			return Dev.$http.get.apply(null, arguments).then((r) => console.log(r.data), (r) => console.error(r.data));
		},
		$httpPost() {
			return Dev.$http.post.apply(null, arguments).then((r) => console.log(r.data), (r) => console.error(r.data));
		},
		scopeFor(el) {
			return angular.element(el).scope();
		},
		directiveCtrl(el, name) {
			return angular.element(el).data('$' + name + 'Controller');
		},
	},

	props = {};


['$rootScope', '$location', '$http', '$q', '$timeout'].forEach(function(name) {
	props[name] = {
		get() {
			return Dev.find(name);
		}
	};
});
Object.defineProperties(Dev, props);

window.Dev = Dev;
