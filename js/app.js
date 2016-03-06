angular.module('Vidmix', ['ui.router', 'vmLibrary'])
	


	.controller('MainCtrl', ['$scope', 'VidLength', 'VidFade', '$http', '$log', '$interval', '$timeout', 'VideoSearchService', 'API_KEY', function($scope, VidLength, VidFade, $http, $log, $interval, $timeout, VideoSearchService, API_KEY) {

    	var idArray = ['A3ckIovZRwk', 'yOom_hezEKI', 'PAgY5MqpUq4']
       	var lengthArray = [];
      	var clipHeightOffsetArray = [];
       	var vidDB = [];
       	var maxTotalWidth = 0;
       
		var setMaxTotalWidth = function() {
			for (i = 0; i < lengthArray.length; i++) {
				maxTotalWidth += lengthArray[i];
			}
			$scope.maxTotalWidth = maxTotalWidth
		}	


		// TO DO: Revisit this logic.
		var createGrid = function() {
			console.log("lengthArray: " + lengthArray)
			console.log("idArray.length: " + idArray.length)

			for (i = 0; i < idArray.length; i++) {
				VidFade.data.vidDB.push({
					vidId: idArray[i],
					vidLength: lengthArray[i],
					clipHeightOffset: clipHeightOffsetArray[i],
					fadeStartTime: 10,
					opacity: 1,
		
				})
				console.log("idarray: " + idArray)
				console.log("lengtharray: " + lengthArray)
				console.log("vidDB: " + vidDB)
			}
			
			function updateScopeVidDB() {
				$scope.vidDB = VidFade.data.vidDB;
			}

			$scope.$watch(function() {return VidFade.data.vidDB}, function(){
				updateScopeVidDB();
			})
			
			setMaxTotalWidth();
		}

		var populateLengthArray = function() {

			// Helper function to push data to lengthArray.
			function pushToLengthArray(index) {
				return function(api) {
			    	lengthArray[index] = api.duration / 2;
			    	// TO DO: Fix this call to createGrid.
			    	if (index == idArray.length - 1) {
			    		createGrid();
			    		return;
			    	}
				}
			};

			for ( i = 0; i < idArray.length; i++) {
				VidLength.fetchURL(idArray[i]).then(pushToLengthArray(i));
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
	     	$scope.createGrid = createGrid;
			$scope.clipHeightOffsetArray = clipHeightOffsetArray;
			$scope.lengthArray = lengthArray;
			$scope.idArray = idArray;
			$scope.youtubeControl = {};
			$scope.vidDB = [];
			$scope.showContainer = "none";
			$scope.vidDB_length = $scope.vidDB.length;
	    }

	    initializeScopeAttributes();


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
			populateLengthArray();

		}

		$scope.$watch(function() {return VidFade.data.opacity}, function() {
       		$scope.opacity = VidFade.data.opacity;
       	})

       	$scope.$watch(function() {return VidFade.data.vidDB}, function() {
       		$scope.vidDB = VidFade.data.vidDB;
       	})

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

	


