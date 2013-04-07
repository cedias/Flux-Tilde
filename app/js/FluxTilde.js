
function FluxTilde (args) {

	//options
	this.soundcloudId = args.soundcloud_id;
	this.binds = args.binds;
	this.templates = args.templates;
	this.debug = args.debug;
	this.firebase = new Firebase(args.firebase);

	/*Track list*/
	this.tracks = [];
	
	/*Actual Track*/
	this.track = 0;

	/*Player Status : ['none', 'playing', 'stopped'] */
	this.playerStatus = "none";

	this._init();

}

/*Initialize Soundcloud & Binds view w/ events*/
FluxTilde.prototype._init = function(){

	//init soundcloud api
	SC.initialize({client_id:this.soundcloudId});

	//bind player controls
	this._bindControls();

	//binds firebase list to app
	if(this.binds.element_list !== undefined)
		this._bindList();

};

/* binds the Firebase list with the html view */
/* TODO: Generics, firebase as an option...*/
FluxTilde.prototype._bindList = function() {
	var that = this;
	var b = this.binds;
	var template = $(this.templates.element).html();

	//on dataChange
	this.firebase.on('value', function(snapshot) {

		//reseting tracks
		that.tracks = [];
		$(b.element_list).html("");

		//iterating over links
		snapshot.forEach(function(child){

			var msgData = child.val();
	  		var temp = Handlebars.compile(template);

	  		//saving each track
			that.tracks.push(child.val());
			//adding element to list
	  		$(b.element_list).append(temp(msgData));

		});


		//unbind previous binds
		$(b.elementList+' li').off('click');

		//binding clickEvent on music list
	  	var items = $(b.element_list+' li').on('click',function() {
			    var index = items.index(this);
			    that.togglePlay(index);
			    if(that.debug){
			    	console.log("Clicked on: " +index);
			    }
		});

	});
};

/*Binds the view with the app*/
FluxTilde.prototype._bindControls = function() {
	var b = this.binds;
	var that = this;

	/*Adding links to FB*/
	$(b.post).on('click', function(){
		var url = $(b.link).val();
		that._post(url);
	});

	/*Play button*/
	$(b.play).on('click', function(){
		that.togglePlay();
	});

	/*Next button*/
	$(b.next).on('click',function(){
		that.next();
	});

	/*Previous button*/
	$(b.previous).on('click',function(){
		that.previous();
	});

}

/*Stream the sound trackNumber*/
FluxTilde.prototype._play = function(trackNumber){

	if(this.musicPlayer !== undefined)
		this.musicPlayer.stop();


	if(trackNumber === undefined)
		var trackNumber = this.track;
	else
		this.track = trackNumber;

	if(this.debug){
		console.log('playing :');
		console.log(this.tracks[this.track]);
	}


	var that = this;
	var trackUrl = "/tracks/" + this.tracks[trackNumber].info.id;
	this.updateTrackInfo(); //update view.


	SC.stream(trackUrl,{
		onfinish:function(){
			that.next();
		},
	}, function(player){
		player.play();
		that.musicPlayer = player;
		/*TODO: Maybe use only one instance of SM2 Object...*/
	});

};

/* Makes the ajax request to post a new url */
FluxTilde.prototype._post = function(url) {
	var bd = this.firebase;
	var parameters = {url:url, client_id: this.client_id};

	if(url !== ''){

		/* Checking if SC knows about this URL */
		SC.get("http://api.soundcloud.com/resolve.json",parameters, function(resp){
			if(resp.errors === undefined && resp.kind === "track")
				bd.push({url:url, info:resp}); //if yes, add !
			else
				console.log("Wrong Soundcloud link");
		});
	}
};


/* Switch to next track */
FluxTilde.prototype.next = function(){
	if(this.musicPlayer !== undefined){

		if(this.debug)
			console.log("Switching to next track");

		this.track = ((this.track + 1)%this.tracks.length);
		this.togglePlay(this.track);
	}
};

/* Switch to previous track */
FluxTilde.prototype.previous = function(){
	if(this.musicPlayer !== undefined){

		if(this.debug)
			console.log("Switching to previous track");

		this.track -= 1;

		if(this.track < 0){
			this.track = this.tracks.length-1;
		}

		this.togglePlay(this.track);
	}
};

/* Stops the music - Not implemented in view...*/
FluxTilde.prototype.stop = function(){

	this.playerStatus == "stopped"
	this.track = 0;

	if(this.musicPlayer !== undefined)
		this.musicPlayer.stop();
};


/* Handles play/pause function in the view */
/* BAD: Model & View = tied in one function */
FluxTilde.prototype.togglePlay = function(track) {

	var button = $(this.binds.play+">i");
	button.removeClass();

	if (track !== undefined) {
			this.playerStatus = "playing";
			button.addClass("icon-pause");
			this._play(track); //play track
			return;
		}

	if (this.musicPlayer === undefined && track === undefined){
		this.playerStatus = "playing";
		button.addClass("icon-pause");
		this._play(0); //play from beggining
		return;
	}

	
	if(this.playerStatus === "playing")
	{
		this.playerStatus = "stopped";
		button.addClass("icon-play");
	} else  {
		this.playerStatus = "playing";
		button.addClass("icon-pause");
	}
	
	this.musicPlayer.togglePause();
	
 };

/*Updates view for track info*/
 FluxTilde.prototype.updateTrackInfo = function() {
 	var template = $(this.templates.info).html();
 	var infoBox = $(this.binds.info);
 	var track = this.tracks[this.track];
 	var temp = Handlebars.compile(template);

 	infoBox.html(temp(track));

 };