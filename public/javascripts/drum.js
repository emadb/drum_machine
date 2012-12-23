$(function(){
    var context = new webkitAudioContext()
    var socket = io.connect('http://localhost:3000');
    var tickInterval, gainTick;

    var playSound = function (sound){
        var request = new XMLHttpRequest();
        request.open("GET", '/sounds/' + sound + '.wav', true);
        request.responseType = "arraybuffer";
         
        request.onload = function() {
            var audioData = request.response;
            soundSource = context.createBufferSource();
            soundBuffer = context.createBuffer(audioData, true);
            soundSource.buffer = soundBuffer;
            soundSource.connect(context.destination);
            soundSource.noteOn(context.currentTime);
        };
        request.send();    
    }

    var tick = function (){
       gainTick.gain.value = 1;
       setTimeout(function(){gainTick.gain.value = 0}, 30);
    };
    
    socket.on('played', function (data) {
        playSound(data.sound);
    });

    $(document).on('click', '#start-tick', function(){

        oscillator = context.createOscillator();
        var filter = context.createBiquadFilter();
        gainTick = context.createGainNode();

        oscillator.connect(filter);
        filter.connect(gainTick);
        gainTick.connect(context.destination);
        
        gainTick.gain.value = 0;

        oscillator.type = 1; 
        oscillator.frequency.value = 1000;
        filter.type = 6;
        filter.frequency.value = 880;

        oscillator.noteOn(0);

        tickInterval = setInterval(tick, 1000);
    });

    $(document).on('click', '#stop-tick', function(){
        clearInterval(tickInterval);
    });

    $(document).on('click', '.drum', function(){
        var sound = $(this).data('sound');
        playSound(sound);
        socket.emit('play', { sound: sound });
    });

    
    
    
    
})
