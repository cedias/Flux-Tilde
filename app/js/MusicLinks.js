
function MusicLinks (args) {

	//options
	this.soundcloudId = args.soundcloudId;
	this.binds = args.binds;
	this.debug = args.debug;
	this.firebase = new Firebase(args.firebase);

	//attributes
	this.linkList = [];
	this.track = 0;
	this.playerStatus = "none";

	this._init();

}

MusicLinks.prototype._init = function(){

	//init soundcloud api
	SC.initialize({client_id:this.soundcloudId});

	//bind player controls
	this._bindControls();

	//binds firebase list to app
	if(this.binds.elementList !== undefined)
		this._bindList();

};

MusicLinks.prototype._bindList = function() {
	var that = this;
	var b = this.binds;
	var template = $(b.template).html();

	//on dataChange
	this.firebase.on('value', function(snapshot) {

		//reseting linklist
		that.linkList = [];
		$(b.elementList).html("");

		//iterating over links
		snapshot.forEach(function(child){

			var msgData = child.val();
	  		var temp = Handlebars.compile(template);

	  		//saving each track
			that.linkList.push(child.val());
			//adding element to list
	  		$(b.elementList).append(temp(msgData));

		});


		//unbind previous binds
		$(b.elementList+' li').off('click');

		//binding clickEvent on music list
	  	var items = $(b.elementList+' li').on('click',function() {
			    var index = items.index(this);
			    that.togglePlay(index);
			    if(that.debug){
			    	console.log("Clicked on: " +index);
			    }
		});

	});
};

MusicLinks.prototype._bindControls = function() {
	var b = this.binds;
	var that = this;

	$(b.post).on('click', function(){
		var url = $(b.link).val();
		that._post(url);
	});

	$(b.play).on('click', function(){
		that.togglePlay();
		that.updateTrackInfo();
	});

	$(b.next).on('click',function(){
		that.next();
		that.updateTrackInfo();
	});

	$(b.previous).on('click',function(){
		that.previous();
		that.updateTrackInfo();
	});

}

MusicLinks.prototype._play = function(trackNumber){

	if(this.musicPlayer !== undefined)
		this.musicPlayer.stop();


	if(trackNumber === undefined)
		var trackNumber = this.track;
	else
		this.track = trackNumber;

	if(this.debug){
		console.log('playing :');
		console.log(this.linkList[this.track]);
	}


	var that = this;
	var trackUrl = "/tracks/" + this.linkList[trackNumber].info.id;


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

		this.track = ((this.track + 1)%this.linkList.length);
		this.togglePlay(this.track);
	}
};

MusicLinks.prototype.previous = function(){
	if(this.musicPlayer !== undefined){

		this.track -= 1;

		if(this.track < 0){
			this.track = this.linkList.length-1;
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
 	var b = this.binds;


 };