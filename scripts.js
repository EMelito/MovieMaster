var movieApp = {
	api_key : "4bd8c1930c83e514913e98cd2b2d1937",
	init : function(){
		movieApp.grabConfig(); //calls function grabConfig
		movieApp.getSessionId();

		movieApp.comedyCount = 0;
		movieApp.actionCount = 0;
		movieApp.horrorCount = 0;
		movieApp.ajaxCount = 0;
		movieApp.ajaxArray=[];
		movieApp.count=0
		movieApp.movieLikes = [];
		movieApp.movies = [508,813,7326,747,115,109428,694,9552,11549,16307,603,348,24428,36557,22538];
		movieApp.recommendMovies = [2493,22970,27205];
		//listen for a click on our star ratings
		$('body').on('change', 'input[type=radio]', function(){
			var rating = $(this).val();
			var movieId = $(this).attr('id').split('-')[0].replace('movie','');
			var movieLike = movieId + "," + rating;

			movieApp.movieLikes[movieApp.count] = movieLike;
			movieApp.count++;
			if(movieApp.count === 15){
				movieApp.recommendMovie();
			}
			movieApp.ratingHandler(rating, movieId);
		});//end on click function
	},//init function
};//movieapp object

//this function will go to the movie db api and get alll the config data that we require.
//when it finishes, it will put the data into movieApp.config
movieApp.grabConfig = function(){
	var configURL = "http://api.themoviedb.org/3/configuration";
	$.ajax(configURL, {
		type: 'GET',
		dataType: 'jsonp',
		data: {
			api_key: movieApp.api_key
		},
		success: function(config){
			movieApp.config = config;
			movieApp.shuffleMovies();//calls next function grabTopRated
		},
	});//end config ajax
};//end grabConfig

movieApp.shuffleMovies = function() {
	for (var i = 0; i< movieApp.movies.length; i++) {
    	var j = Math.floor(Math.random() * (i + 1));
    	var temp = movieApp.movies[i];
    	movieApp.movies[i] = movieApp.movies[j];
    	movieApp.movies[j] = temp;
    }//end for loop
    movieApp.getMovies(movieApp.movies);
};//end shuffleMovies

movieApp.getMovies = function(){
	for (var i=0;i<movieApp.movies.length;i++){
		var movieIDURL = "http://api.themoviedb.org/3/movie/"+movieApp.movies[i];
		$.ajax(movieIDURL, {
			type:'GET',
			dataType: 'jsonp',
			data: {
				api_key : movieApp.api_key
			},
			success: function(data){
				movieApp.displayMovies(data);
			},
		});//end top-rated ajax	
	};//end for loop
};//end getMovies

movieApp.displayMovies= function(data){
	var title = $('<h2>').text(data.title);
	var image = $('<img>').attr('src', movieApp.config.images.base_url + "w500" + data.poster_path);
	var rating = $('fieldset.rateMovie')[0].outerHTML;
	rating = rating.replace(/star/g,'movie'+data.id+'-star');
	rating = rating.replace(/rating/g, 'rating-'+data.id);
	var movieWrap = $('<div>').addClass('movie');
	movieWrap.append(title, image, rating);
	$('body').append(movieWrap);
};//end displayMovies

movieApp.ratingHandler = function(rating, movieId){
	$.ajax('http://api.themoviedb.org/3/movie/'+movieId+'/rating',{
		type: 'POST',
		data: {
			api_key: movieApp.api_key,
			guest_session_id: movieApp.session_id,
			value: rating*2,
		},
		success: function(response){
			if(response.status_code===1) {
				console.log('Thanks for the vote!');
			}
			else{
				console.log(response.status_message);
			}
		}//end success
	});//end ajax request
};//end rateHandler

movieApp.getSessionId = function(){
	$.ajax('http://api.themoviedb.org/3/authentication/guest_session/new', {
		data: {
			api_key: movieApp.api_key,
		},
		type: 'GET',
		dataType: 'jsonp',
		success : function(session){
			//store the session ID for later use
			movieApp.session_id = session.guest_session_id;
		},
	});
};

movieApp.recommendMovie = function(){
	for(i=0;i<movieApp.movieLikes.length;i++){

		var scoreArray = movieApp.movieLikes[i].split(',');
		var id = scoreArray[0];
		var score = parseInt(scoreArray[1]);
		var movieLikeIDURL = "http://api.themoviedb.org/3/movie/"+id;

		movieApp.ajaxCall(movieLikeIDURL);
	};//end for loop
};//end recommendMovie

movieApp.ajaxCall = function(movieLikeIDURL){
		var genre = "";
		$.ajax(movieLikeIDURL, {
		type:'GET',
		dataType: 'jsonp',
		data: {
			api_key : movieApp.api_key
		},
		success: function(data){
			var movieGenre = data.genres[0];
			genre = movieGenre.name;
			var ajaxID = data.id;
			movieApp.ajaxArray.push(ajaxID+","+genre);
			movieApp.ajaxCount++;
			if (movieApp.ajaxCount === movieApp.count){
				movieApp.tally();
			}
		}
	});//end ajax
};//end ajaxCall

movieApp.tally = function(){
	for(var i=0;i<movieApp.ajaxArray.length;i++){
		var idArray = movieApp.ajaxArray[i].split(",");
		var ajaxID = idArray[0];
		var ajaxGenre = idArray[1];
		for(var j=0;j<movieApp.movieLikes.length;j++){
			var likeArray = movieApp.movieLikes[j].split(',');
			var likeID = likeArray[0];
			var likeScore = parseInt(likeArray[1]);
			if(ajaxID===likeID){
				if (ajaxGenre === "Comedy"){
					movieApp.comedyCount+=likeScore;
					}
				else if (ajaxGenre === "Action"){
						movieApp.actionCount+=likeScore;
					}
				else if (ajaxGenre === "Horror"){
						movieApp.horrorCount+=likeScore;
					}
				else {
						console.log("not a genre");
					}
				break;
			}
		}
	}
	if (parseInt(movieApp.comedyCount) > parseInt(movieApp.actionCount) && parseInt(movieApp.comedyCount) > parseInt(movieApp.horrorCount)){
		var genre = "Comedy";
		title = "Princess Bride";
		var id = movieApp.recommendMovies[0];
	}
	else if (parseInt(movieApp.actionCount) > parseInt(movieApp.comedyCount) && parseInt(movieApp.actionCount) > parseInt(movieApp.horrorCount)){
		var genre = "Action";
		title = "Inception";
		var id = movieApp.recommendMovies[0];
	}
	else if (parseInt(movieApp.horrorCount) > parseInt(movieApp.actionCount) && parseInt(movieApp.horrorCount) > parseInt(movieApp.comedyCount)){
		var genre = "Horror";
		title = "Cabin in the Woods";
		var id = movieApp.recommendMovies[0];
	}
	else if (parseInt(movieApp.comedyCount)===parseInt(movieApp.actionCount)===parseInt(movieApp.horrorCount)){
		var genre = "Comedy, Horror and Action";
		title = "Princess Bride, Inception and Cabin in the Woods";
		var id = movieApp.recommendMovies[0];
	}
	else if (parseInt(movieApp.comedyCount)===parseInt(movieApp.actionCount)){
		var genre = "Comedy and Action";
		title = "Princess Bride and Inception";
		var id = movieApp.recommendMovies[0];
	}
	else if (parseInt(movieApp.comedyCount)===parseInt(movieApp.horrorCount)){
		var genre = "Comedy and Horror";
		title = "Princess Bride and Cabin in the Woods";
		var id = movieApp.recommendMovies[0];
	}
	else if (parseInt(movieApp.actionCount)===parseInt(movieApp.horrorCount)){
		var genre = "Action and Horror";
		title = "Inception and Cabin in the Woods";
		var id = movieApp.recommendMovies[0];
	}
	else {
		console.log("something's broken");
	}
	$('div.recommend').html("<div id='openModal' class='modalDialog'><div><a href='#close' title='Close' class='close'>X</a><h2>Thanks for your input!</h2><p>You seem to like " + genre + " movies. You should check out " + title + "!</p></div></div>");
	$('.getRecommendation').css("display", "block");
};
	
$(function() {
	movieApp.init();
});//document ready