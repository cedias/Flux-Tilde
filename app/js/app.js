
function formSubmit(form){

var name = $("#title").val();
var url = $("#link").val()

linkSubmit(name,url);
}


function linkSubmit(name,url){
	var bd = new Firebase('music-links.firebaseIO.com');
	bd.push({name:name, url:url});
}

var listRef = new Firebase('music-links.firebaseIO.com');
listRef.on('child_added', function(snapshot) {
  var msgData = snapshot.val();
  	$("#linkList").append("<li><a href=\""+msgData.url+"\">"+ msgData.name+"</a></li>");

});