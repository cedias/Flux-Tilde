

var options = {
	firebase:'music-links.firebaseIO.com',
	soundcloudId:'3f45abb44a7e483b35d0b04047849967',
	binds: {
		post:'#linkForm',
		link:'#link',
		play:'#play',
		next:'#next',
		trackInfo: '#trackInfo',
		previous:'#previous',
		elementList:'#linkList',
		template:'#element-template'
	},
	debug:true
}

var ml = new MusicLinks(options);



