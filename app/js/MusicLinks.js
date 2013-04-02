
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
			    that.play(index);

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
		that.post(url);
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

MusicLinks.prototype.post = function(url) {
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

MusicLinks.prototype.play = function(trackNumber){

	if(this.musicPlayer !== undefined)
		this.stop();

	if(trackNumber === undefined)
		var trackNumber = this.track;
	else
		this.track = trackNumber;

	if(this.debug){
		console.log('playing ' +this.track)
		console.log(this.linkList);
	}

	this.playerStatus = "playing";
	this.togglePlay();

	var that = this;
	var trackUrl = "/tracks/" + this.linkList[trackNumber].info.id;


	SC.stream(trackUrl,{
		autoPlay:true,
		multiShotEvents: true,
		onfinish:function(){that.next();},
	}, function(player){
		that.musicPlayer = player;
	});

};

MusicLinks.prototype.next = function(){
	if(this.debug)
		console.log("Switching to next track");

	this.track = ((this.track + 1)%this.linkList.length);

	if(this.musicPlayer !== undefined)
		this.play();
};

MusicLinks.prototype.previous = function(){

	this.track -= 1;

	if(this.track < 0){
		this.track = this.linkList.length-1;
	}

	if(this.musicPlayer !== undefined)
		this.play();
};

MusicLinks.prototype.stop = function(){
	this.playerStatus = "stopped";

	if(this.musicPlayer !== undefined)
		this.musicPlayer.stop();
};

MusicLinks.prototype.pause = function(){

	if(this.musicPlayer !== undefined)
		this.musicPlayer.togglePause();
};

MusicLinks.prototype.togglePlay = function() {
	var button = $(this.binds.play+">i");
	button.removeClass();

	if(this.playerStatus === "none" || this.playerStatus === "stopped")
		button.addClass("icon-play");
	else
		button.addClass("icon-pause");

	this.pause();
};