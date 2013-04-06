
function MusicLinks (args) {

	//options
	this.soundcloudId = args.soundcloud_id;
	this.binds = args.binds;
	this.templates = args.templates;
	this.debug = args.debug;
	this.firebase = new Firebase(args.firebase);



	//attributes
	this.tracks = [];
	this.track = 0;
	this.playerStatus = "none";

	this._init();

}

/*Initialize Soundcloud & Binds view w/ events*/
MusicLinks.prototype._init = function(){

	//init soundcloud api
	SC.initialize({client_id:this.soundcloudId});

	//bind player controls
	this._bindControls();

	//binds firebase list to app
	if(this.binds.element_list !== undefined)
		this._bindList();

};

/* binds the Firebase list with the html view */
MusicLinks.prototype._bindList = function() {
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

/*Binds the player controls*/
MusicLinks.prototype._bindControls = function() {
	var b = this.binds;
	var that = this;

	$(b.post).on('click', function(){
		var url = $(b.link).val();
		that._post(url);
	});

	$(b.play).on('click', function(){
		that.togglePlay();
	});

	$(b.next).on('click',function(){
		that.next();
	});

	$(b.previous).on('click',function(){
		that.previous();
	});

}

/*Stream the sound list*/
MusicLinks.prototype._play = function(trackNumber){

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
	this.updateTrackInfo();


	SC.stream(trackUrl,{
		onfinish:function(){
			that.next();
		},
	}, function(player){
		player.play();
		that.musicPlayer = player;
	});

};

MusicLinks.prototype._post = function(url) {
	var bd = this.firebase;
	var parameters = {url:url, client_id: this.client_id};

	if(url !== ''){

		SC.get("http://api.soundcloud.com/resolve.json",parameters, function(resp){
			if(resp.errors === undefined && resp.kind === "track")
				bd.push({url:url, info:resp});
			else
				console.log("Wrong Soundcloud link");
		});
	}
};



MusicLinks.prototype.next = function(){
	if(this.musicPlayer !== undefined){

		if(this.debug)
			console.log("Switching to next track");

		this.track = ((this.track + 1)%this.tracks.length);
		this.togglePlay(this.track);
	}
};

MusicLinks.prototype.previous = function(){
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

MusicLinks.prototype.stop = function(){

	this.playerStatus == "stopped"
	this.track = 0;

	if(this.musicPlayer !== undefined)
		this.musicPlayer.stop();
};


MusicLinks.prototype.togglePlay = function(track) {

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

 MusicLinks.prototype.updateTrackInfo = function() {
 	var template = $(this.templates.info).html();
 	var infoBox = $(this.binds.info);
 	var track = this.tracks[this.track];
 	var temp = Handlebars.compile(template);

 	infoBox.html(temp(track));

 };