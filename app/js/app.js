

var ml = new MusicLinks('music-links.firebaseIO.com','3f45abb44a7e483b35d0b04047849967');

$("#linkForm").on('click', function(){
	var url = $("#link").val();
	ml.post(url);
});

$("#play").on('click', function(){
	ml.play(0);
})

$("#pause").on('click', function(){
	ml.pause();
})


var source   = $("#element-template").html();
ml.bindList(linkList, source);






/*
SC.stream("/tracks/293", function(sound){
  sound.play();
});*/
