angular.module('vmLibrary', [])

	.constant('API_KEY', 'AIzaSyCCjazRr2tqfJSotjepk6NMj7KcrzRuySU')
	.constant('YT_event', {
							  STOP:            0, 
							  PLAY:            1,
							  PAUSE:           2,
							  STATUS_CHANGE:   3 })
	.constant('idArray', ['A3ckIovZRwk', 'yOom_hezEKI', 'PAgY5MqpUq4'])
	

	.factory('VidLength', ['$http', 'API_KEY', function($http, API_KEY) {

		console.log('hi factory ( page load )');

		  return { 
		    fetchURL:
			 function(myid) { console.log('factory fired')
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
		          console.log("failure")   
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

	.service('VideosService', ['$window', '$rootScope', '$log', function ($window, $rootScope, $log) {

	  var service = this;

	  var youtube = {
	    ready: false,
	    player: null,
	    playerId: null,
	    videoId: null,
	    videoTitle: null,
	    playerHeight: '480',
	    playerWidth: '640',
	    state: 'stopped'
	  };
	  var results = [];
	  var upcoming = [
	    {id: 'kRJuY6ZDLPo', title: 'La Roux - In for the Kill (Twelves Remix)'},
	    {id: '45YSGFctLws', title: 'Shout Out Louds - Illusions'},
	    {id: 'ktoaj1IpTbw', title: 'CHVRCHES - Gun'},
	    {id: '8Zh0tY2NfLs', title: 'N.E.R.D. ft. Nelly Furtado - Hot N\' Fun (Boys Noize Remix) HQ'},
	    {id: 'zwJPcRtbzDk', title: 'Daft Punk - Human After All (SebastiAn Remix)'},
	    {id: 'sEwM6ERq0gc', title: 'HAIM - Forever (Official Music Video)'},
	    {id: 'fTK4XTvZWmk', title: 'Housse De Racket â˜â˜€â˜ Apocalypso'}
	  ];
	  var history = [
	    {id: 'XKa7Ywiv734', title: '[OFFICIAL HD] Daft Punk - Give Life Back To Music (feat. Nile Rodgers)'}
	  ];

	  $window.onYouTubeIframeAPIReady = function () {
	    $log.info('Youtube API is ready');
	    youtube.ready = true;
	    service.bindPlayer('placeholder');
	    service.loadPlayer();
	    $rootScope.$apply();
	  };

	  function onYoutubeReady (event) {
	    $log.info('YouTube Player is ready');
	    youtube.player.cueVideoById(history[0].id);
	    youtube.videoId = history[0].id;
	    youtube.videoTitle = history[0].title;
	  }

	  function onYoutubeStateChange (event) {
	    if (event.data == YT.PlayerState.PLAYING) {
	      youtube.state = 'playing';
	    } else if (event.data == YT.PlayerState.PAUSED) {
	      youtube.state = 'paused';
	    } else if (event.data == YT.PlayerState.ENDED) {
	      youtube.state = 'ended';
	      service.launchPlayer(upcoming[0].id, upcoming[0].title);
	      service.archiveVideo(upcoming[0].id, upcoming[0].title);
	      service.deleteVideo(upcoming, upcoming[0].id);
	    }
	    $rootScope.$apply();
	  }

	  this.bindPlayer = function (elementId) {
	    $log.info('Binding to ' + elementId);
	    youtube.playerId = elementId;
	  };

	  this.createPlayer = function () {
	    $log.info('Creating a new Youtube player for DOM id ' + youtube.playerId + ' and video ' + youtube.videoId);
	    return new YT.Player(youtube.playerId, {
	      height: youtube.playerHeight,
	      width: youtube.playerWidth,
	      playerVars: {
	        rel: 0,
	        showinfo: 0
	      },
	      events: {
	        'onReady': onYoutubeReady,
	        'onStateChange': onYoutubeStateChange
	      }
	    });
	  };

	  this.loadPlayer = function () {
	    if (youtube.ready && youtube.playerId) {
	      if (youtube.player) {
	        youtube.player.destroy();
	      }
	      youtube.player = service.createPlayer();
	    }
	  };

	  this.launchPlayer = function (id, title) {
	    youtube.player.loadVideoById(id);
	    youtube.videoId = id;
	    youtube.videoTitle = title;
	    return youtube;
	  }

	  this.listResults = function (data) {
	    results.length = 0;
	    for (var i = data.items.length - 1; i >= 0; i--) {
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

	  this.queueVideo = function (id, title) {
	    upcoming.push({
	      id: id,
	      title: title
	    });
	    return upcoming;
	  };

	  this.archiveVideo = function (id, title) {
	    history.unshift({
	      id: id,
	      title: title
	    });
	    return history;
	  };

	  this.deleteVideo = function (list, id) {
	    for (var i = list.length - 1; i >= 0; i--) {
	      if (list[i].id === id) {
	        list.splice(i, 1);
	        break;
	      }
	    }
	  };

	  this.getYoutube = function () {
	    return youtube;
	  };

	  this.getResults = function () {
	    return results;
	  };

	  this.getUpcoming = function () {
	    return upcoming;
	  };

	  this.getHistory = function () {
	    return history;
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
	
	.directive('ngDraggable', ['$document', 'VidLength', function($document) {
	  return {
	    restrict: 'A',
	    scope: {
	      dragOptions: '=ngDraggable'
	    },
	    link: function(scope, elem, attr) {
	      var startX, startY, x = 0, y = 0,
	          start, stop, drag, container;

	      var width  = elem[0].offsetWidth,
	          height = elem[0].offsetHeight;

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
	        console.log(e)
	        startX = e.clientX - elem[0].offsetLeft;
	      //  startY = e.clientY - elem[0].offsetTop;
	        $document.on('mousemove', mousemove);
	        $document.on('mouseup', mouseup);
	        if (start) start(e);
	      });

	      // Handle drag event
	      function mousemove(e) {
	      //  y = e.clientY - startY;
	        x = e.clientX - startX;
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
	          if (x < container.left) {
	            x = container.left - 8;
	          } else if (x > container.right - width) {
	            x = container.right - width - 8;
	          }
	        //   if (y < container.top) {
	        //     y = container.top;
	        //   } else if (y > container.bottom - height) {
	        //     y = container.bottom - height;
	        //   }
	         }

	        elem.css({
	       //   top: y + 'px',
	          left:  x + 'px'
	        });
	      }
	    }
	  }

	}]) ///
	
	.directive('ngVidUnit', [function() {
		return {
			restrict: 'E',
			template: '<div></div>',
			link: function(scope, element) {
			}

		}
	}])

//
//	DIRECTIVE TO CREATE <YOUTUBE> PLAYERS
//
	.directive('youtube', function($window, $interval, $timeout, YT_event, youTubeApiService, VidFade) {
  return {
    restrict: "E",

    scope: {
      height: "@",
      width: "@",
      videoid: "@",
      index: '@'
    },

    template: '<div></div>',

    link: function(scope, element, attrs, $rootScope) {
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      var player;

      // scope.$watch(attrs.myCurrentTime, function(value) {
      //   opacity1 = value;
      //   updateTime();
      // });

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

    //
	// 
	//
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

      //
      // Plays next video
      //	
      			if (event.data == YT.PlayerState.UNSTARTED) {

      				console.log("unstarted video loaded with index: " + scope.index)
      				console.log(event)
      				player.pauseVideo()


      			}



      //
      // Lowers opacity when playback time equals stopPlayAt
      //
			    var time, rate, remainingTime, nextVidIndex;
			    var stopPlayAt = 3;
			    
			    // clearTimeout(stopPlayTimer);
			    if (event.data == YT.PlayerState.PLAYING) {
			     	 time = player.getCurrentTime();
			     	 nextVidIndex = Number(scope.index) - 1;

			      // Add .4 of a second to the time in case it's close to the current time
			      // (The API kept returning ~9.7 when hitting play after stopping at 10s)
				      if (time + .4 < stopPlayAt) {
					        rate = player.getPlaybackRate();
					        remainingTime = (stopPlayAt - time) / rate;
					        stopPlayTimer = setTimeout(pauseVideo, remainingTime * 1000);
					        console.log("NextVidIndex is: " + nextVidIndex)
					        console.log("scope.index is: " + scope.index)
					        

				      }
      			


			    }
			    
			    function pauseVideo() {
    				$interval(adjustOpacity, 1000, 100)
    				$interval(adjustVolume, 1000, 100)

 			 	}

				 		
		 		function adjustOpacity() {
					//VidFade.data.opacity = 1 - player.getCurrentTime() / 10;
					VidFade.data.vidDB[scope.index].opacity = 1 - player.getCurrentTime() / 10;
					console.log(VidFade.data.vidDB[scope.index].opacity)
					//console.log("VidFade.data.opacity is: " + VidFade.data.opacity)
		 		}

		 		function adjustVolume() {

		 			player.setVolume(100 - (player.getCurrentTime() * 10) )
		 		}

            }
          } 
        });        
      }


      scope.$watch('height + width', function(newValue, oldValue) {
        if (newValue == oldValue) {
          return;
        }
    
        player.setSize(scope.width, scope.height);
      
      });

      scope.$watch('videoid', function(newValue, oldValue) {
        if (newValue == oldValue) {
          return;
        }
        
        player.cueVideoById(scope.videoid);
      
      });

      scope.$on(YT_event.STOP, function () {
        player.seekTo(0);
        player.stopVideo();
      });

      scope.$on(YT_event.PLAY, function () {
        console.log("RECEIVING");
        player.playVideo();
      }); 

      scope.$on(YT_event.PAUSE, function () {
        player.pauseVideo();
      });  



    }  
  };
})
			

	
