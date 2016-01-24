angular.module('Vidmix', ['ui.router', 'vmLibrary'])
	


	.controller('MainCtrl', ['$scope', 'VidLength', 'VidFade', '$http', '$log', '$interval', '$timeout', 'VideosService', 'API_KEY', function($scope, VidLength, VidFade, $http, $log, $interval, $timeout, VideosService, API_KEY) {

       var idArray = ['A3ckIovZRwk', 'yOom_hezEKI', 'PAgY5MqpUq4']
       var myid = 'A3ckIovZRwk';
       var lengthArray = [];
       var clipHeightOffsetArray = [];
       var vidDB = [];
       var maxTotalWidth = 0;
       $scope.maxTotalWidth = 200;
       
       
       
       function changeOpacity() {
       		$scope.opacity = VidFade.data.opacity;
       }
       $scope.$watch(function() {return VidFade.data.opacity}, function() {
       		changeOpacity();
      
       })

       function updateScopeVidDB() {
       		$scope.vidDB = VidFade.data.vidDB;
       }
       $scope.$watch(function() {return VidFade.data.vidDB}, function() {
       		updateScopeVidDB()
       		console.log("watch is running, updating vidDB on main controller scope")


       })

       $scope.tester = function() {
       	if (VidFade.data.fadeGo == false) {
       		VidFade.data.fadeGo = true;
       	}
       	else if (VidFade.data.fadeGo == true) {
       		VidFade.data.fadeGo = false;
       	}

       }

  


		for (i = 0; i < idArray.length; i++) {
			console.log("COUNT ME");
			clipHeightOffsetArray.push(40 * i)
		}
		



		var setMaxTotalWidth = function() {
			for (i = 0; i < lengthArray.length; i++) {
				maxTotalWidth += lengthArray[i];
			}
			console.log("setMaxTotalWidth ran successfully")
			$scope.maxTotalWidth = maxTotalWidth
		}	


		

		var createGrid = function() {
			console.log("lengthArray: " + lengthArray)
			console.log("idArray.length: " + idArray.length)

			for (i = 0; i < idArray.length; i++) {
				VidFade.data.vidDB.push({
					vidId: idArray[i],
					vidLength: lengthArray[i],
					clipHeightOffset: clipHeightOffsetArray[i],
					fadeStartTime: 10,
					opacity: 1 
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
			// showContainer();


		}

		$scope.createGrid = createGrid;

		$scope.clipHeightOffsetArray = clipHeightOffsetArray;
		$scope.lengthArray = lengthArray;
		$scope.idArray = idArray;
		$scope.youtubeControl = {};
		$scope.vidDB = [];
		$scope.showContainer = "none";

		$scope.vidDB_length = $scope.vidDB.length;

		

		

		var addLengths = function(data) {
					
			function makeHandle(i) {
				return function(api) {
					console.log("api.duration " + i + " is " + api.duration);
			    	lengthArray[i] = api.duration / 2;
			    	console.log("lengthArray " + i + " is " + lengthArray[i]);
			    	console.log(lengthArray)

			    	if (i == 3) {
			    		createGrid();
			    		return;
			    	}
				}
			};
			var reqComplete;
			for (i = 0; i < 4; i++) {
				VidLength.fetchURL(idArray[i]).then(makeHandle(i));
				clipHeightOffsetArray.push(40 * (clipHeightOffsetArray.length));
			}
			// createGrid();
			console.log(clipHeightOffsetArray)

		}

		// angular.element(window).ready(function () {
  //       	$timeout($scope.tester2, 5000)

        	
  //   	});

		$scope.tester2 = function() {
			
			// var myPromise = function() {
			// 	var deferred = $q.defer();
			// 	promise.then(function(res) {
			// 		deferred.resolve
			// 	})
			// }
			
			console.log('tester2 ran successfully')
			idArray.push('IQBC5URoF0s');

			addLengths();
			// createGrid();

		}
        
        




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

    init();

    function init() {
      $scope.youtube = VideosService.getYoutube();
      $scope.results = VideosService.getResults();
      $scope.upcoming = VideosService.getUpcoming();
      $scope.history = VideosService.getHistory();
      $scope.playlist = true;
    }

    $scope.launch = function (id, title) {
      VideosService.launchPlayer(id, title);
      VideosService.archiveVideo(id, title);
      VideosService.deleteVideo($scope.upcoming, id);
      $log.info('Launched id:' + id + ' and title:' + title);
    };

    $scope.queue = function (id, title) {
      idArray.push(id);
      $log.info('Queued id:' + id + ' and title:' + title);
    };

    $scope.delete = function (list, id) {
      VideosService.deleteVideo(list, id);
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
        VideosService.listResults(data);
        $log.info(data);
      })
      .error( function () {
        $log.info('Search error');
      });
    }

    $scope.tabulate = function (state) {
      $scope.playlist = state;
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

	


