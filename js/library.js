angular.module('vmLibrary', [])

	.constant('API_KEY', 'AIzaSyCCjazRr2tqfJSotjepk6NMj7KcrzRuySU')
	.constant('YT_event', {
							  STOP:            0, 
							  PLAY:            1,
							  PAUSE:           2,
							  STATUS_CHANGE:   3 })
	.constant('idArray', ['A3ckIovZRwk', 'yOom_hezEKI', 'PAgY5MqpUq4'])
	

	.factory('VidLength', ['$http', 'API_KEY', function($http, API_KEY) {

		  return { 
		    fetchURL:
			 function(myid) {
			   return $http({
			     method: 'GET',
			     url: 'https://www.googleapis.com/youtube/v3/videos',
			     cache: true,
			     params: {
					part: "contentDetails",
					id : myid,
					key: API_KEY
				 }
			    })
			    .then(function(response) { console.log('API call worked');
		          rawDuration = response.data.items[0].contentDetails.duration.split("S")[0].split("M")
		          var minutes = rawDuration[0].split("PT")[1]
		          var seconds = rawDuration[1]
		          var duration = (Number(minutes) * 60) + Number(seconds)
		          console.log("video duration is " + duration + " seconds")
		          return { data:
		          	duration, duration
		          }
		        }, function(response) {
		          console.log("failure");   
		  	})
		   }

	}
	}])

	.factory('VidFade', [function() {
		
		return {
			data : {
				opacity : 1,
				fadeGo : false,
				vidDB : []
			}
		}

	}])

	.service('VideoSearchService', [function () {

	  var results = [];

	  this.populateResults = function (data) {
	    results.length = 0;
	    for (var i = 0; i < data.items.length; i++) {
	      results.push({
	        id: data.items[i].id.videoId,
	        title: data.items[i].snippet.title,
	        description: data.items[i].snippet.description,
	        thumbnail: data.items[i].snippet.thumbnails.default.url,
	        author: data.items[i].snippet.channelTitle
	      });
	    }
	    return results;
	  }

	  this.getResults = function () {
	    return results;
	  };


	}])

	.factory("youTubeApiService", function($q, $window) {
	  
	  var deferred = $q.defer();
	  var apiReady = deferred.promise;

	  $window.onYouTubeIframeAPIReady = function() {
	    deferred.resolve();
	  }

	  return {
	    onReady: function(callback) {
	      apiReady.then(callback);
	    }
	  }   

	})
	
	.directive('ngDraggable', ['$document', function($document) {
		return {

		    restrict: 'A',

		    scope: {
		      dragOptions: '=ngDraggable'
		    },

		    link: function(scope, elem, attr) {
				
				var startX, curX = 0;
				var start, stop, drag, container;

		      	// Obtain drag options
		      	if (scope.dragOptions) {
		        	start  = scope.dragOptions.start;
		        	drag   = scope.dragOptions.drag;
		        	stop   = scope.dragOptions.stop;
		        	var id = scope.dragOptions.container;
		        	console.log(id + 'id test');
		        	if (id) {
		            	container = document.getElementById(id).getBoundingClientRect();
		        	}
		      	}

		      	// Bind mousedown event
		      	elem.on('mousedown', function(e) {
			        e.preventDefault();
			        startX = e.clientX - elem[0].offsetLeft;
			        $document.on('mousemove', mousemove);
			        $document.on('mouseup', mouseup);
			        if (start) start(e);
		      	});

		      	// Handle drag event
		      	function mousemove(e) {
			        curX = e.clientX - startX;
			        setPosition();
			        if (drag) drag(e);
		      	}

		      	// Unbind drag events
		      	function mouseup(e) {
			        $document.unbind('mousemove', mousemove);
			        $document.unbind('mouseup', mouseup);
			        if (stop) stop(e);
		      	}

		      	// Move element, within container if provided
		      	function setPosition() {
		        	if (container) {
		          		if (curX < container.left) {
		            		curX = container.left - 8;
		          		} 
		          		else if (curX > container.right - elem[0].offsetWidth) {
		            		curX = container.right - elem[0].offsetWidth - 8;
		          		}
		         	}

		        	elem.css({left:  curX + 'px'});
		      	}
		    }
		}
	}])
	
	.directive('ngVidUnit', [function() {
		return {
			restrict: 'E',
			template: '<div></div>',
			link: function(scope, element) {
			}

		}
	}])

	//	Directive to create <youtube> players.
	.directive('youtube', function($interval, YT_event, youTubeApiService, VidFade) {
  		return {
    		restrict: "E",

    		scope: {
      			height: "@",
				width: "@",
				videoid: "@",
				index: '@'
    		},

    		template: '<div></div>',

    		link: function(scope, element) {
      			var tag = document.createElement('script');
				tag.src = "https://www.youtube.com/iframe_api";
				var firstScriptTag = document.getElementsByTagName('script')[0];
				firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      			var player;

    			youTubeApiService.onReady(function() {
        			player = setupPlayer(scope, element);
      			});

 
      			function setupPlayer(scope, element) {
        			return new YT.Player(element.children()[0], {
	          			playerVars: {
			            	autoplay: 0,
				            html5: 1,
				            theme: "dark",
				            modestbranding: 1,
				            iv_load_policy: 3,
				            showinfo: 0,
				            controls: 0,
				            autohide: 1,
				            disablekb: 1,
				            rel: 0
          				},
          
          				height: scope.height,
          				width: scope.width,
          				videoId: scope.videoid,
          				events: {
            				'onStateChange': function(event) {

            					///////////
            					// Start: Reminder code for $apply and $emit.
              					var message = {
                					event: YT_event.STATUS_CHANGE,
                					data: ""
              					};
              
		              			switch(event.data) {
		                			case YT.PlayerState.PLAYING:
		                  				message.data = "PLAYING";
		                  				break;
		                			case YT.PlayerState.ENDED:
		                  				message.data = "ENDED";
		               					break;
		                			case YT.PlayerState.UNSTARTED:
		                  				message.data = "NOT PLAYING";
		                 				break;
		                			case YT.PlayerState.PAUSED:
		                  				message.data = "PAUSED";
		                  				break;
		              			}

	              				scope.$apply(function() {
	                				scope.$emit(message.event, message.data);
	              				});
	              				// End: Reminder code for $apply and $emit.
	              				///////////

      							
			    				if (event.data == YT.PlayerState.PLAYING) {
			    					// Lower opacity when playback time equals stopPlayAt
			    					var stopPlayAt = 3;
			     	 				var time = player.getCurrentTime();
			     	 				var nextVidIndex = Number(scope.index) - 1;

			      					// Add .4 of a second to the time in case it's close to the current time
			      					// (The API kept returning ~9.7 when hitting play after stopping at 10s)
				      				if (time + .4 < stopPlayAt) {
					        			var remainingTime = (stopPlayAt - time) / player.getPlaybackRate();
								        setTimeout(adjustOpacityAndVolume, remainingTime * 1000);
				      				}

				      				function adjustOpacityAndVolume() {
    									$interval(adjustOpacity, 1000, 100)
    									$interval(adjustVolume, 1000, 100)
	 			 					}

					 		
			 						function adjustOpacity() {
										VidFade.data.vidDB[scope.index].opacity = 1 - player.getCurrentTime() / 10;
			 						}

			 						function adjustVolume() {
			 							player.setVolume(100 - (player.getCurrentTime() * 10) );
			 						}
      							}
            				}
          				} 
        			});        
      			}
			}  
  		};
	})
			

	
