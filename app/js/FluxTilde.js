
function FluxTilde (args) {

	//options
	this.soundcloudId = args.soundcloud_id;
	this.binds = args.binds;
	this.templates = args.templates;
	this.debug = args.debug;
	this.firebase = new Firebase(args.firebase);
	this.player = undefined; //to get the flux object
	this.tracks = [] ; //fb objects
	this.index = 0;

	this._init();


};


FluxTilde.prototype._init = function(){
	this._bindList();
	this._bindControls();
	this._switchInfo(this.index);
}

/* binds the Firebase list with the html view */
/* TODO: Generics, firebase as an option...*/
FluxTilde.prototype._bindList = function() {
	var that = this;
	var b = this.binds;
	var template = $(this.templates.element).html();
	var urls = [];
	this.firebase.on('value',function(snapshot){
		
		$(b.element_list).html("");
		//iterating over links
		snapshot.forEach(function(child){

			var msgData = child.val();
	  		var temp = Handlebars.compile(template);

	  		//saving each track
			that.tracks.push(msgData);
			
			urls.push(msgData.url);
			//adding element to list
	  		$(b.element_list).append(temp(msgData));

		});

		//unbind previous binds
		$(b.elementList+' li').off('click');

		//binding clickEvent on music list
	  	var items = $(b.element_list+' li').on('click',function() {
			    var index = items.index(this);
			    that._switchInfo(index);
			    that.player.selectStream(index);
			    if(that.debug){
			    	console.log("Clicked on: " +index);
			    }
		});

		that.player = new Flux({
			SCid : that.soundcloudId,
			links : urls,
			autostart : false,
			autoplay : true,
			repeat : true,
			debug:true,		
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
		that._switchInfos(that.player.togglePlay());
	});

	/*Next button*/
	$(b.next).on('click',function(){
		that._switchInfos(that.player.next());
		
	});

	/*Previous button*/
	$(b.previous).on('click',function(){
		that._switchInfos(that.player.previous());
	});

}

FluxTilde.prototype._switchInfo = function(index){
	var template = $(this.templates.info).html();
	var temp = Handlebars.compile(template);
	$("#playing").html(temp(this.tracks[index]));

}


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


