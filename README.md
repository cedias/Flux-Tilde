#Flux ~


Flux Tilde helps making playlists with Soundcloud's API and Firebase as link storage.

Demo is here => http://cedias.github.io/Flux-Tilde/app/

##Usage:

```javascript

var options = {
  firebase:'YourFirebase.firebaseIO.com',
	soundcloud_id:'YourSCAPPId',
	binds: {  /*The html id's that will be bind with the click action*/
		post:'#linkForm', 
		link:'#link', 
		play:'#play',   
		next:'#next', 
		previous:'#previous',
		element_list:'#tracks',
		info:'#info',
	},
	templates:{ /*the templates to fill the page with*/
		element:'#element-template',
		info:'#info-template'
	},
	debug:true /*debug mode */
}

var ft = new FluxTilde(options);

```
##Dependencies

- Jquery
- Handlebars

##Todo:

- Refactor code using a framework.
- Make demo more pretty :)



=> MIT Licence

