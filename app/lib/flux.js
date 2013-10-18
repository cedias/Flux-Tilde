function Flux(args){

	this.streams = [];
	this.tracksLoaded = 0;
	this.currentStream = 0;
	
	this.soundcloud_client_id = args.SCid;
	SC.initialize({client_id:this.soundcloud_client_id});

	this.totalStreams = args.links.length;
	this.autoplay = args.autoplay;
	this.autostart = args.autostart;
	this.repeat = args.repeat;
	this.debug = args.debug;

	//Transform the links to streams
	this._linksToStreams(args.links); // /!\ asynchronous

}

/**-------------------------- Private Methods ----------------------**/
/*Url array -> Stream array*/
Flux.prototype._linksToStreams = function(list){

	for(var i=0;i<list.length;i++){
		var stream = this._newStreamFromLink(list[i],i);
		this.streams.push(stream);
	}
}

/*URL -> Stream*/
Flux.prototype._newStreamFromLink = function(link,index){
	/*link is only soundcloud for now
	Plan: Match w/ != Streams
	*/
	var args = {
		flux:this,
		url:link,
		index:index
	};
	return new Stream_Soundcloud(args);
}

/*Manage stream events*/
Flux.prototype._eventManager = function(evt){
	if(evt.msg === "Loaded"){
		this.tracksLoaded++;
		if(evt.index === 0 && this.autostart)
			this.togglePlay();
	}

	if(evt.msg === "Song Ended"){
		if(this.currentStream === this.totalStreams-1 && this.repeat){
			this.next();
		}
		else if(this.currentStream !== this.totalStreams-1 && this.autoplay)
		{
			this.next();
		}
	}

	if(evt.msg === "Error")
		console.log("Error on Stream index "+evt.index+":"+evt.err_msg);
}

/**-------------------------- Flux Controls - Public Methods ------------------------ **/

/**
Streams interface:

stream.stop() -> void //stops the stream (set stream position to 0) 
stream.togglePlay() -> void //play if stream is paused/stopped and pauses 
stream.setVolume(int volume:[0,100]:%)
stream.getVolume()
stream.setPosition(int position:seconds)
stream.getPosition()
**/

/**  Delegations **/
Flux.prototype.stop = function() {
	if(this.streams[this.currentStream].streamable){
		this.streams[this.currentStream].stop();
		this.streams[this.currentStream].setPosition(0);
	}
};

Flux.prototype.togglePlay = function(){
	if(this.debug)
		console.log("toggling_play index: " + this.currentStream);

	if(!this.streams[this.currentStream].streamable)
		this.currentStream = (this.currentStream+1)%this.totalStreams;

	this.streams[this.currentStream].togglePlay();
	console.log("play:"+this.currentStream);
};

Flux.prototype.setVolume = function(volume){

	if(volume >=0 && volume <= 100)
		this.streams[this.currentStream].setVolume(volume);
	else
		console.log("Error: volume [0;100] you gave "+volume);
};

Flux.prototype.getVolume = function(){
	this.streams[this.currentStream].getVolume();
};

Flux.prototype.setPosition = function(time){

	this.streams[this.currentStream].setPosition(time);
};

Flux.prototype.getPosition = function(){
	this.streams[this.currentStream].getPosition();
};


/*Flux Methods*/

Flux.prototype.next = function(){

	this.stop();
	this.currentStream = (this.currentStream+1)%this.totalStreams;

	if(this.autoplay)
		this.togglePlay();
};

Flux.prototype.previous = function(){

	this.stop();
	if(this.currentStream !== 0)
		this.currentStream--;
	else
		this.currentStream = this.totalStreams-1;

	if(this.autoplay)
		this.togglePlay();
};

Flux.prototype.selectStream = function(song) {
	if(this.streams[this.currentStream].streamable){
		this.stop();
		if(song >= 0 && song <= this.totalStreams-1)
			this.currentStream = song
		else
			console.log("Error: wrong song number");

		if(this.autoplay)
			this.togglePlay();
		return true;
	}
	return false;
};
