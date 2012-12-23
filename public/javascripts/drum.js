$(function(){
    var context = new webkitAudioContext()
    var socket = io.connect('http://localhost:3000');
    
    socket.on('played', function (data) {
        playSound(data.sound);
    });

    $(document).on('click', '.drum', function(){
        var sound = $(this).data('sound');
        playSound(sound);
        socket.emit('play', { sound: sound });
    });

    function playSound(sound){
        var request = new XMLHttpRequest();
        request.open("GET", '/sounds/' + sound + '.wav', true);
        request.responseType = "arraybuffer";
         
        request.onload = function() {
            var audioData = request.response;
            soundSource = context.createBufferSource();
            soundBuffer = context.createBuffer(audioData, true/*make mono*/);
            soundSource.buffer = soundBuffer;
            soundSource.connect(context.destination);
            soundSource.noteOn(context.currentTime);
        };
        request.send();    
    }
    
    
})
