angular.module('Vidmix', ['ui.router', 'vmLibrary'])
	


	.controller('MainCtrl', ['$scope', 'VidLength', 'VidFade', '$http', '$log', '$interval', '$timeout', 'VideoSearchService', 'API_KEY', function($scope, VidLength, VidFade, $http, $log, $interval, $timeout, VideoSearchService, API_KEY) {

    	var idArray = ['A3ckIovZRwk', 'yOom_hezEKI', 'PAgY5MqpUq4']
      	var clipHeightOffsetArray = [];
       	var vidDB = [];
       	var maxTotalWidth = 0;
       	initializeScopeAttributes();
       
		var setMaxTotalWidth = function() {
			if (VidFade.data.vidDB.length == idArray.length) {
				for (i = 0; i < VidFade.data.vidDB.length; i++) {
					console.log("current video length: " + VidFade.data.vidDB[i].vidLength);
					maxTotalWidth += VidFade.data.vidDB[i].vidLength;
				}
				console.log("maxTotalWidth: " + maxTotalWidth);
				$scope.maxTotalWidth = maxTotalWidth;
			}
		}

		var populateVidDB = function() {

			function onSuccessfulRetrieval(index) {
				return function(api) {
					VidFade.data.vidDB.push({
						vidID: idArray[index],
						vidLength: api.duration / 2,
						clipHeightOffset: clipHeightOffsetArray[index],
						fadeStartTime: 10,
						opacity: 1,
						success: true,
						player: null
					})
					setMaxTotalWidth();
				}
			}

			function onFailedRetrieval(index) {
				return function() {
					VidFade.data.vidDB.push({
						vidID: idArray[index],
						vidLength: 0,
						clipHeightOffset: clipHeightOffsetArray[index],
						fadeStartTime: 10,
						opacity: 1,
						success: false,
						player: null
					})
					setMaxTotalWidth();
				}
			}

			for ( i = 0; i < idArray.length; i++) {
				VidLength.fetchURL(idArray[i])
				.then(onSuccessfulRetrieval(i))
				, onFailedRetrieval(i);
			}
		}

		var populateClipHeightOffsetArray = function() {
			for (i = 0; i < idArray.length; i++) {
				clipHeightOffsetArray.push(40 * (clipHeightOffsetArray.length));
			}
		}

	    function initializeScopeAttributes() {
	      	$scope.results = VideoSearchService.getResults();
	     	$scope.maxTotalWidth = 400;
			$scope.youtubeControl = {};
			$scope.vidDB = [];
			$scope.showContainer = "none";
			$scope.vidDB_length = $scope.vidDB.length;
	    }

	    $scope.pushToIDArray = function (id, title) {
	      idArray.push(id);
	      $log.info('Queued id:' + id + ' and title:' + title);
	    };


	    $scope.search = function () {
	      $http.get('https://www.googleapis.com/youtube/v3/search', {
	        params: {
	          key: 'AIzaSyCCjazRr2tqfJSotjepk6NMj7KcrzRuySU',
	          type: 'video',
	          maxResults: '8',
	          part: 'id,snippet',
	          fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
	          q: this.query
	        }
	      })
	      .success( function (data) {
	        VideoSearchService.populateResults(data);
	        $log.info(data);
	      })
	      .error( function () {
	        $log.info('Search error');
	      });
	    }

	    // Populates necesary arrays.
		// Creates video grid.
		$scope.RunVidmixTest = function() {

			populateClipHeightOffsetArray();
			populateVidDB();

		}

		$scope.$watch(function() {return VidFade.data.opacity}, function() {
       		$scope.opacity = VidFade.data.opacity;
       	})

       	$scope.$watch(function() {return VidFade.data.vidDB}, function() {
       		$scope.vidDB = VidFade.data.vidDB;
       	})

       	$scope.dragOptions = {
	        start: function(e) {
	          console.log("STARTING");
	        },
	        drag: function(e) {
	          console.log("DRAGGING");
	        },
	        stop: function(e) {
	          console.log("STOPPING");
	        },
	        container: 'container'
    	}

    }])

	.controller('VidCtrl', ['$scope', function($scope) {

	 

	}])


	.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('home', {
				url: '/',
				templateUrl: 'templates/home.html',
				controller: 'MainCtrl',
				// resolve: {
				// 	geoname: ['$stateParams', 'getGeoname', function($stateParams, getGeoname) {
				// 		console.log('real getGeoname is called');
				// 		return getGeoname($stateParams.country);
				// 	}]
				// }
			})
			.state('vidz', {
				url: '/vidz',
				templateUrl: 'templates/vidz.html',
				controller: 'VidCtrl'	
			})
	}])

	


