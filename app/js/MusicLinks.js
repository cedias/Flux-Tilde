
function MusicLinks (args) {

	//options
	this.soundcloudId = args.soundcloudId;
	this.firebase = new Firebase(args.firebase);
	this.binds = args.binds;
	this.debug = args.debug;

	//attributes
	this.linkList = [];
	this.track = 0;

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
		that.play(0);
	})

	$("#pause").on('click', function(){
		that.pause();
	})


}

MusicLinks.prototype.post = function(url) {
	var bd = this.firebase;
	var parameters = {url:url, client_id: this.client_id};

	if(url !== ''){

		SC.get("http://api.soundcloud.com/resolve.json",parameters, function(resp){
			if(resp.errors === undefined)
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
	var that = this;
	var trackUrl = "/tracks/" + this.linkList[trackNumber].info.id;


	SC.stream(trackUrl,function(musicPlayer){
		that.musicPlayer = musicPlayer;
  		that.musicPlayer.play();
	});
	
}

MusicLinks.prototype.next = function(){
	this.track = ((this.track + 1)%this.linkList.length);

	if(this.musicPlayer !== undefined)
		this.play();
}

MusicLinks.prototype.previous = function(){

	this.track -= 1;
	
	if(this.track < 0){
		this.track = this.linkList.length-1;
	}

	if(this.musicPlayer !== undefined)
		this.play();
}

MusicLinks.prototype.stop = function(){

	if(this.musicPlayer !== undefined)
		this.musicPlayer.stop();
}

MusicLinks.prototype.pause = function(){

	if(this.musicPlayer !== undefined)
		this.musicPlayer.togglePause();

}