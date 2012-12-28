$(function(){
    var context = new webkitAudioContext()
    var socket = io.connect(location.origin);
    var tickInterval, gainTick; 
    var tickIsEnabled = false;
    var sounds = [];

    var setupTickOscillator = function(){

        oscillator = context.createOscillator();
        var filter = context.createBiquadFilter();
        gainTick = context.createGainNode();

        oscillator.connect(filter);
        filter.connect(gainTick);
        gainTick.connect(context.destination);
        
        gainTick.gain.value = 0;

        oscillator.type = 1; 
        oscillator.frequency.value = 900;
        filter.type = 6;
        filter.frequency.value = 880;

        oscillator.noteOn(0);
    }

    var loadAndPlay = function (sound){
        if (sounds[sound] === undefined){
            var request = new XMLHttpRequest();
            request.open("GET", '/sounds/' + sound + '.wav', true);
            request.responseType = "arraybuffer";
             
            request.onload = function() {
                sounds[sound] = request.response;
                play(sound);
            };
            request.send();    
        }
        else{
            play(sound);
        }
    }

    var play = function(sound){
        soundSource = context.createBufferSource();
        soundBuffer = context.createBuffer(sounds[sound], true);
        soundSource.buffer = soundBuffer;
        soundSource.connect(context.destination);
        soundSource.noteOn(context.currentTime);
    }

    var tick = function (){
        if (tickIsEnabled){
            gainTick.gain.value = 0.8;
            setTimeout(function(){gainTick.gain.value = 0}, 15);
        }
    };
    
    socket.on('played', function (data) {
        loadAndPlay(data.sound);
    });

    socket.on('tick', function(data){
        tick();
    });

    socket.on('joined', function(data){
        var userList = $("#users")
        userList.html('');
        $(data).each(function(i, item){
            userList.append('<li>' + item.userName + '</li>');
        });
    });

    $(document).on('click', '#start-tick', function(){
        tickIsEnabled = true;
    });

    $(document).on('click', '#stop-tick', function(){
        tickIsEnabled = false;
    });

    $(document).on('click', '.drum', function(){
        var sound = $(this).data('sound');
        loadAndPlay(sound);
        socket.emit('play', { sound: sound });
    });

    $(document).on('click', '#join-drum', function(){
        socket.emit('join', { userName: $('#user-name').val() });
        $('#userModal').modal('hide')
    });

    setupTickOscillator();
    $('#userModal').modal({keyboard: false});
    
    
})
