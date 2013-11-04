
function FluxTilde (args) {

	//options

	this.binds = {
		post:'#linkForm',
		link:'#link',
		play:'#play',
		next:'#next',
		previous:'#previous',
		element_list:'#tracks',
		info:'#info',
		toggle_admin:'#toggle_admin',
		admin:"#admin",
		admin_panel:"#admin_panel"
	};

	this.templates ={
		element:'#element-template',
		info:'#info-template'
	};

	this.soundcloudId = args.soundcloud_id;
	this.debug = args.debug;
	this.firebase = new Firebase(args.firebase);
	this.player = undefined; //to get the flux object
	this.tracks = [] ; //fb objects
	this.index = 0;
	this.duration = 0;

	this._init();


};


FluxTilde.prototype._init = function(){
	this._bindList();
	this._bindControls();

	if(this.tracks.length > 0)
		this._switchInfo(this.index);
}

FluxTilde.prototype._bindList = function() {
	var that = this;
	var b = this.binds;
	var template = $(this.templates.element).html();
	var urls = [];
	this.firebase.on('value',function fbase_value(snapshot){
		
		$(b.element_list).html("");
		//iterating over links
		snapshot.forEach(function fbase_value_foreach(child){

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

		//instanciate music player
		that.player = new Flux({
			SCid : that.soundcloudId,
			links : urls,
			autostart : false,
			autoplay : true,
			repeat : true,
			debug:true,		
		});

		//binding clickEvent on music list
	  	var items = $(b.element_list+' li').on('click',function() {
			    var index = items.index(this);
			    that._switchInfo(index);
			    that.player.selectStream(index);
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
		$(b.link).val("");
	});

	/*Play button*/
	$("#playing_img").on('click', function(){
		that._switchInfo(that.player.togglePlay());
	});

	/*Next button*/
	$(b.next).on('click',function(){
		that._switchInfo(that.player.next());
		
	});

	/*Previous button*/
	$(b.previous).on('click',function(){
		that._switchInfo(that.player.previous());
	});
	
	/*Toggle admin*/
	$(b.toggle_admin).on('click',function toggleAdmin(){
		if($(this).hasClass("fa-minus"))
		{
			$(this).removeClass("fa-minus");
			$(b.admin).height(50);
			$(b.admin_panel).hide();
			$(this).addClass("fa-plus");
		}
		else
		{
			$(this).removeClass("fa-plus");
			$(b.admin).height(100);
			$(b.admin_panel).show();
			$(this).addClass("fa-minus");
		}
			
	});

};

FluxTilde.prototype._switchInfo = function(index){
	var template = $(this.templates.info).html();
	var temp = Handlebars.compile(template);
	var that = this;
	window.flxplayer = this.player; /*sad sad sad :'(*/
	$("#playing").html(temp(this.tracks[index]));
	clearInterval(this.duration);
	this.duration = setInterval(that._updateDuration,500);

};


FluxTilde.prototype._updateDuration = function(){
    var player = window.flxplayer;
    var val = Math.floor((player.getPosition()/player.getLength())*100);
    console.log("val: "+val);
    $("#duration").css({width: val+"%"});
};

/* Makes the ajax request to post a new url  -  FIREBASE OBJECT ?*/
FluxTilde.prototype._post = function(url) {
	var bd = this.firebase;
	var clientid = this.soundcloudId;
	var param = {url:url, client_id: clientid};

	if(url !== ''){

		/* Checking if SC knows about this URL */
		SC.get("http://api.soundcloud.com/resolve.json",param, function(resp){
			if(resp.errors === undefined && resp.kind === "track")
				bd.push({url:url, info:resp}); //if yes, add !
			else
				console.log("Wrong Soundcloud link");
		});
		
	}
};


