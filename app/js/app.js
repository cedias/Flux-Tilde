

var options = {
	firebase:'music-links.firebaseIO.com',
	soundcloud_id:'3f45abb44a7e483b35d0b04047849967',
	binds: {
		post:'#linkForm',
		link:'#link',
		play:'#play',
		next:'#next',
		previous:'#previous',
		element_list:'#tracks',
		info:'#info',
	},
	templates:{
		element:'#element-template',
		info:'#info-template'
	},
	debug:true
}

var ft = new FluxTilde(options);



