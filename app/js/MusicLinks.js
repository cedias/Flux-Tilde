


function MusicLinks (firebase,client_id) {

	var that = this;
	this.client_id = client_id;
	this.firebase = new Firebase(firebase);
	this.linkList = [];

	SC.initialize({client_id:client_id});

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

MusicLinks.prototype.bindList = function(listId, template) {
	var that = this;

	this.firebase.on('child_added', function(snapshot) {
		var msgData = snapshot.val();
  		var temp = Handlebars.compile(template);

		that.linkList.push(snapshot.val());
  		$(listId).append(temp(msgData));
	});

};


MusicLinks.prototype.play = function(trackNumber){
	var that = this;
	var trackUrl = "/tracks/" + this.linkList[trackNumber].info.id;
	var nextTrack = (trackNumber++)%this.linkList.length;

	if(trackNumber === undefined && this.musicPlayer !== undefined) {
		this.musicPlayer.play();
	}
		else
	{
		SC.stream(trackUrl, function(musicPlayer){

			that.musicPlayer = musicPlayer;
	  		musicPlayer.play();
	  		//musicPlayer.onfinish(that.play(nextTrack)) infinite loop
		});
	}
}

MusicLinks.prototype.stop = function(){

	if(this.musicPlayer !== undefined)
		this.musicPlayer.stop();
}

MusicLinks.prototype.pause = function(){

	if(this.musicPlayer !== undefined)
		this.musicPlayer.pause();
}