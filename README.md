#Flux ~


Flux Tilde helps making playlists with Soundcloud's API and Firebase as link storage.

Demo is here => http://cedias.github.io/Flux-Tilde/app/

PS: Adding links is deactivated, obviously !

##Usage:

```javascript

var options = {
  firebase:'YourFirebase.firebaseIO.com',
	soundcloud_id:'YourSoundcloudAppId',
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

```html
  <script src="lib/jquery.js"></script>
  <script src="lib/handlebars.js"></script>
  <script src='https://cdn.firebase.com/v0/firebase.js'></script>
  <script src="http://connect.soundcloud.com/sdk.js"></script>
  <script src="js/FluxTilde.js"></script>
```


##Todo:
- Add firebase auth.
- Refactor code w/ angular or backbonejs + reduce dependencies.
- Make demo more pretty :)


##License

MIT Licence

