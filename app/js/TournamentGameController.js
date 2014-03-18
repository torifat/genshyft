function TournamentGameController($scope,$resource,$cookieStore,$timeout,$location){
    //$scope.currentProblem
    //$scope.game = $resource('test_data/python_game.json').get();
    //$scope.mobile_game = $resource('test_data/mobile_python_game.json').get();
    
    /*
    To play a game via the SingPath API you must do the following. 
    1. Create a game using create_practice_game and get the gameID in the response. 
    2. Call check_solution_for_game() for a problem until the player correctly solves the problem. 
    3. Call fetch(gameID) to get the updated status of the game after correct solves. 
    4. Redirect the player to the proper page once the game is completed.
    */


    $scope.skip_problem_count = 0;
    $scope.current_problem_index = 0;

    if($cookieStore.get("type")){
      $scope.gameType = $cookieStore.get("type"); //retrieve game type
    }
    
    /*
    Create Tournament Game.
    
    */
    
    $scope.fetch = function(gameID){
		$scope.GameModel = $resource('/jsonapi/game/:gameID');
      
		$scope.GameModel.get({"gameID":gameID}, function(response){
        $scope.game = response;
        $scope.update_remaining_problems();
        //Added by GENShYFT - Glen
        $scope.get_mentor($scope.game.heatID, $scope.game.playerID);
		});
    };

    $scope.update_remaining_problems = function(){
      $scope.remaining_problems = [];
      //loop through problems and find unsolved. Add to remaining_problems.
      for (var i = 0; i < $scope.game.problemIDs.length; i++) {
        if($scope.game.solvedProblemIDs.indexOf($scope.game.problemIDs[i])<0){
          console.log($scope.game.problemIDs[i]);
          $scope.remaining_problems.push($scope.game.problemIDs[i]);
        }
      }

      if($scope.remaining_problems.length == 0){
        $scope.get_mentee($scope.game.heatID, $scope.game.playerID);
        $("#finish_all_info").modal();
				//alert("Congrats! You have solved all the problems in this round.");
        //$location.search({"heatID":$scope.game.heatID}).path("tournament-ranking");
        //window.location.href="index.html#/roundranking?heatID="+$scope.game.heatID;

      }
      //Update the current problem index based on remaining problems and items skipped. 
      $scope.move_to_next_unsolved_problem();
    };

    //By GENShYFT - Getting Mentee
    $scope.get_mentee = function(heatID, playerID){
      $resource('/jsonapi/get_heat_ranking').get({"heatID":heatID}, function(response){
        $scope.current_heat = response;
        for(var i =0;i< $scope.current_heat.ranking.length;i++){
          if($scope.current_heat.ranking[i].playerid === playerID){
            $scope.mentee_name = $scope.current_heat.ranking[i].mentee;
            break;
          }
        }
      }); 
    };

    //By GENShYFT - Getting Mentor
    $scope.get_mentor = function(heatID, playerID){
      $scope.mentor_id = null;
      $scope.mentor_hasArrived = false;

      $resource('/jsonapi/get_heat_ranking').get({"heatID":heatID}, function(response){
        $scope.current_heat = response;
        for(var i =0;i< $scope.current_heat.ranking.length;i++){
          if($scope.current_heat.ranking[i].playerid === playerID){
            $scope.mentor_id = $scope.current_heat.ranking[i].mentorID;
            $scope.mentor_name= $scope.current_heat.ranking[i].mentor;
            $scope.mentor_hasArrived = $scope.current_heat.ranking[i].mentorHasArrived;
            break;
          }
        }
      });
      console.log("get_mentor()");
      
      //if($scope.mentor_id == null && $scope.mentor_hasArrived == false){
        $timeout(function(){ $scope.get_mentor(heatID, playerID); }, 30000); 
      //}

      //$timeout(function(){ $scope.get_mentor(heatID, playerID); }, 5000); 
    };

    $scope.get_mentor_once = function(heatID, playerID){
      $scope.mentor_id = null;
      $scope.mentor_hasArrived = false;

      $resource('/jsonapi/get_heat_ranking').get({"heatID":heatID}, function(response){
        $scope.current_heat = response;
        for(var i =0;i< $scope.current_heat.ranking.length;i++){
          if($scope.current_heat.ranking[i].playerid === playerID){
            $scope.mentor_id = $scope.current_heat.ranking[i].mentorID;
            $scope.mentor_name= $scope.current_heat.ranking[i].mentor;
            $scope.mentor_hasArrived = $scope.current_heat.ranking[i].mentorHasArrived;
            break;
          }
        }
      });
      console.log("get_mentor_once()");
    };


    //By GENShYFT - Round to Ranking Redirection
    $scope.round_end_ranking = function(heatID){
      $location.search({"heatID":$scope.game.heatID}).path("tournament-ranking");
      $('.modal-backdrop').remove();
    };

    //By GENShYFT - Round to Join Tournament Redirection
    $scope.round_end_tournament_lobby = function(heatID){
      $location.path("tournament-grpjoin");
      $('.modal-backdrop').remove();
    };

    //By GENShYFT - Setting Mentor Arrival
    $scope.mentor_arrived =function(playerID, heatID){
      console.log("mentor_arrived : heatID=" + heatID);

      var data = {
        'playerID':playerID,
        'heatID':heatID
      };
      $scope.mentor_arrival = $resource('/jsonapi/mentor_has_arrived');
      var hasArrived = new $scope.mentor_arrival(data);
      hasArrived.$save(function(response){
        if(response.error) {
          console.log(response.error);
        }else{
          console.log(response);
        }
      });
      $scope.get_mentor_once(heatID, playerID);
    }

    $scope.move_to_next_unsolved_problem = function(){
      $scope.sampleAnswers = "yes";
      if ($scope.remaining_problems.length>0){
        $('#t11').addClass('active');
        $('#t21').removeClass('active');
        $('#ta11').addClass('active');
        $('#ta21').removeClass('active');
        //Todo:If you are already on the problem, you don't need to reload it. 
        $scope.current_problem = $scope.remaining_problems[$scope.skip_problem_count % $scope.remaining_problems.length];
        $scope.current_problem_index = $scope.game.problemIDs.indexOf($scope.current_problem);
        $scope.solution1 = $scope.game.problems.problems[$scope.current_problem_index].skeleton;
        $scope.solution_check_result = null;
        var editor = ace.edit("editorPractice");
        editor.getSession().setMode("ace/mode/" + $scope.game.problems.problems[$scope.current_problem_index].interface.codeHighlightKey);
      }else{
        $scope.current_problem=null;
        $scope.current_problem_index = null;
        $scope.solution1 = null;
        $scope.solution_check_result = null;
      }

    };

    $scope.skip_problem = function(){
      $('#t11').addClass('active');
      $('#t21').removeClass('active');
      $('#ta11').addClass('active');
      $('#ta21').removeClass('active');
      if ($scope.remaining_problems.length>1){
        $scope.skip_problem_count += 1;
        $scope.move_to_next_unsolved_problem();
      }
      console.log("Skipping problem. count="+$scope.skip_problem_count+" remaining "+$scope.remaining_problems.length);
    };


    $scope.check_solution_for_game = function() {
      //$scope.solution
      //$scope.current_problem
      //$scope.game.gameID
      $('#t11').removeClass('active');
      $('#t21').addClass('active');
      $('#ta11').removeClass('active');
      $('#ta21').addClass('active');
      $scope.SaveResource = $resource('/jsonapi/verify_for_game');
      //alert($scope.game.gameID);
      $scope.theData = {user_code:$scope.solution1,
                        problem_id:$scope.current_problem,
                        game_id:$scope.game.gameID};
      
      //Post the solution
      var item = new $scope.SaveResource($scope.theData);
      item.$save(function(response) { 
            $scope.solution_check_result = response;
            //If solved, update the game.
            if($scope.solution_check_result.last_solved){
                $scope.fetch($scope.game.gameID);
            }
      });
    };

    $scope.verify_solution = function() {
      //$scope.solution
      //$scope.tests
      $scope.solution_check_result = $resource('/jsonapi/check_code_with_interface').get();
    };
    //Mobile Problem Methods
    //If the user selects a correct permutation. 
    //You can mark the permutation correct and post to the server. 
    //This will result in the game proceeding. 

    $scope.check_permutation = function() {
      //$scope.permutation
      //$scope.tests
      //alert("permutation="+$scope.permutation);
      //Update the solution with the permutations of lines.
      $scope.permutation_lines = "";
      //Loop through the permutation and add all of the lines of code
      for (var i = 0; i < $scope.permutation.length; i++) {
        //alert(parseInt($scope.permutation[i]));
        $scope.permutation_lines += $scope.game.problems.problems[$scope.current_problem_index].lines[parseInt($scope.permutation[i])-1]+"\n";
      }
      //Then put the resulting combination of lines in the solution model. 
      $scope.solution = $scope.permutation_lines;
      $scope.solution_check_result =  {"error":"This solution will not compile."};
      $scope.ner =  {"error":"This solution will not compile."};
      
      var nonErrorResult = $scope.game.problems.problems[$scope.current_problem_index].nonErrorResults[$scope.permutation];
      if(nonErrorResult){
    
        $scope.solution_check_result = nonErrorResult;
        $scope.ner = nonErrorResult;
        //If the solution passes, then call verify for the solution to progress in the game. 
        if(nonErrorResult.solved){
          $scope.check_solution_for_game();
          //alert("All solved. Checking solution for game."+nonErrorResult.solved);
        }
      }
    };
    

	//Check for a roundID to see if this is a tournament game. 
	if($cookieStore.get("roundID")){
      $scope.roundID = $cookieStore.get("roundID"); 
      $scope.tournamentGameID = $cookieStore.get("tournamentGameID"); 
      $scope.fetch($scope.tournamentGameID);
      //$scope.update_remaining_problems();
      console.log("Found a roundID in the cache "+$scope.roundID);//retrieve name of the path
      console.log("Found a gameID in the cache "+$scope.tournamentGameID);//retrieve name of the path
      
    }
    else{
      alert("No roundID passed to TournamentGameController.")
    }

}

