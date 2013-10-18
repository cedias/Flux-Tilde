function Stream_Soundcloud(args){ /*implements stream*/

	this.flux = args.flux; //for notifications
	this.stream_type = "Soundcloud";
	this.state = "created";
	this.streamable = false;
	this.client_id = args.flux.soundcloud_client_id;
	this.url = args.url;
	this.index = args.index;
	this.player = undefined; //contains SC player, loaded asynchronously
	this._trackToStream(this.url);
}

/*resolves a soundcloud track url*/

Stream_Soundcloud.prototype._trackToStream = function(url) {
	var self = this;
	var params = {
		onfinish : function(){self.flux._eventManager({msg:"Song Ended",index:self.index})}
		};
	SC.get("http://api.soundcloud.com/resolve",{"url":url}, function(track){

			self.streamable = track.streamable;
			if(track.errors === undefined && track.kind === "track" && track.streamable){
				SC.stream("/tracks/"+track.id, params, function(sound){
						self.player = sound;
  						self.state = "loaded";
  						self.flux._eventManager({msg:"Loaded",index:self.index});
			
				});
			}
			else
			{
				self.state = "error";

				if(!self.streamable)
					self.flux._eventManager({msg:"Error",index:self.index, err_msg:"SC Link not streamable"});
				else
					self.flux._eventManager({msg:"Error",index:self.index, err_msg:"Wrong SC Link"});
			}
	});
};


/**			Controls			**/

Stream_Soundcloud.prototype.stop = function() {
	this.player.stop();
	this.player.setPosition(0);
};

Stream_Soundcloud.prototype.togglePlay = function(){
	this.player.togglePause();
};

Stream_Soundcloud.prototype.setVolume = function(volume){

	if(volume >=0 && volume <= 100)
		this.player.setVolume(volume);
	else
		console.log("Error: volume [0;100] you gave "+volume);
	return this.player.volume;
};

Stream_Soundcloud.prototype.getVolume = function(){
	return this.player.volume;
};

Stream_Soundcloud.prototype.setPosition = function(time){

	this.player.setPosition(time*1000);
	return this.player.position;
};

Stream_Soundcloud.prototype.getPosition = function(){
	return this.player.position;
};
