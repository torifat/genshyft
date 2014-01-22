

function PurposeDrivenController($scope,$resource,$location,$cookieStore,$http){


    // this method gets the parameter , variables are declared as youtube and vno
    $scope.location = $location;

    $scope.$watch('location.search()', function() {
        $scope.you = ($location.search()).youtube;
        $scope.tube = $scope.you.split("watch?v=");
        $scope.youtube = $scope.tube[1].split("&list=");
       // $scope.youtube = $scope.tube.split("list=");
        console.log($scope.youtube);
    }, true);


    $scope.$watch('location.search()', function() {
        $scope.vno = ($location.search()).vno;
    }, true);



	


		$scope.videotoWatch = 0;

	 $scope.get_videos = function(){
          console.log("get_purpose driven videos");
          $resource("/jsonapi/purposeVideos/ALL").get({},function(response){
              $scope.purposeVideos = response; // purposeVideos stores the Json files
			  $scope.videoArray = $scope.purposeVideos.Videos[0].title;
               console.log($scope.purposeVideos);
        	 })
        }


	     $scope.get_videos_unlocked = function(){
          console.log("get_purpose driven videos unlocked");
          $resource("/jsonapi/purposeVideos/CURRENT").get({},function(response){
              $scope.purposeVideosUnlocked = response;
               console.log($scope.purposeVideosUnlocked);
        	 })
        }      


        $scope.view_video = function(address,no){
        	$scope.videotoWatch = address;
        	//window.location.replace('#/purposedriven-play?v=' +value);
        	//$location.path('purposedriven-play')
  			//alert(document.URL);
  			//alert(value);
  			 $location.search({'youtube':address,'vno':no}).path('purposedriven-play')
        }  


        $scope.nextVideo = function (vno,purposeVideo,videosUnlock){
			var vnoNumber = parseInt(vno);
             if(purposeVideo.length-1 > vnoNumber)
              {
                if(videosUnlock[(vnoNumber+1)].s == "false"){
                  alert ("You have unlock a new video!" );
				  
							 
                }
		
                // if lock, prompt lock
                $location.search({'youtube':purposeVideo[(vnoNumber+1)].vlink, 'vno':(vnoNumber+1)}).path('purposedriven-play') 
              }
              else{
                alert (" Oops , no more");
              }
             
        }



		$scope.saveNewUnlock = function(videoNumber){
		

		  $scope.videoUnlockedResource = $resource('/jsonapi/purposeVideos/CURRENT');

			  var data = {"no": videoNumber,
						  "s": "true"};

			  var item = new $scope.videoUnlockedResource(data);
				item.$save(function(response) { 
                  $scope.response = response;
                  //Handle any errors
                  console.log(response);
				  
			  })
		}



























  



	};