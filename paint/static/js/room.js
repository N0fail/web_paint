var pusher = new Pusher('ec3b28d1f46d5d2bdea7', {
      cluster: 'eu',
      forceTLS: true
    });
var channel;
var init_complete = false;
var my_id_in_room, my_role_in_room, my_nickname;

//DONT WORK FOR REFRESH
window.onbeforeunload = function() {
    var myHeaders = new Headers({
        'id' : my_id_in_room,
        'nickname': my_nickname,
        'act' : 'leave'
    });
    var myInit = { method: 'GET',
           headers: myHeaders};
    fetch('fetch',myInit)
        .then(function(){
            //console.log("yes clicked");
        })
        .catch(function(){
            console.log("error")
        });
    return 1;
    //return "You have attempted to leave this page.  If you have made any changes to the fields without clicking the Save button, your changes will be lost.  Are you sure you want to exit this page?";
    //window.confirm("Do you really want to leave?");
};

$(document).ready( function(){
    var myHeaders = new Headers({
            'act' : 'init'
        });
    var myInit = { method: 'GET',
               headers: myHeaders};
        fetch('fetch',myInit)
            .then(function(response){
                return response.json();
            })
            .then(function(response){
                channel = pusher.subscribe(response["channel_id"]);
                my_id_in_room = response['my_id_in_room'];
                my_role_in_room = response['my_role_in_room'];
                my_nickname = response['my_nickname'];
                if (my_role_in_room == "master"){
                    $("#set_question").prop("disabled", true);
                    $("#set_guessing").prop("disabled", true);
                }
                else{
                    if (my_role_in_room == "questioner"){
                        $("#set_question").prop("disabled", false);
                        $("#set_guessing").prop("disabled", false);
                    }
                    else{
                        $("#set_question").prop("disabled", true);
                        $("#set_guessing").prop("disabled", false);
                    }
                }

                init_complete = true;
                channel.bind('new_question', function (data) {
                    $('#messages-q').append('<div class="msg-left"><bdo>' + data.author + ": " + data.message + '? </bdo></div>');
                    $('#messages-q').scrollTop($('#messages-q')[0].scrollHeight);
                    if (data.current_questioner == my_id_in_room) {
                        my_role_in_room = "questioner"
                        $('#current_role').text("Your current role: " + my_role_in_room);
                    } else {
                        $("#set_question").prop("disabled", true);
                        if (data.current_master == my_id_in_room){
                            my_role_in_room = "master"
                            $('#modal_for_master').modal('show');
                            $('#question_for_master').text(data.message + '?');
                            $('#current_role').text("Your current role: " + my_role_in_room);
                        }
                        else{
                            my_role_in_room = "watcher"
                            $('#current_role').text("Your current role: " + my_role_in_room);
                        }
                    }
                    $('#messages-q').scrollTop($('#messages-q')[0].scrollHeight);
                });

                channel.bind('question_answered', function (data) {
                    var select_str = 'bdo:contains(' + data.message + ')';

                    if (data.answer == 'yes') {
                        $(select_str).addClass('yes_answered');
                    } else {
                        $(select_str).addClass('no_answered');
                    }
                    if (data.current_questioner == my_id_in_room) {
                        $("#set_question").prop("disabled", false);
                    } else {
                        $("#set_question").prop("disabled", true);
                    }
                });

                channel.bind('new_guessing', function (data) {
                    if (data.is_correct) {
                        //$('#messages-g').append('<div class="msg-right"><bdo class="yes_answered"> Is it ' + data.guessing + "? :" + data.author + '</bdo></div>');
                        toastr.options = {
                          "closeButton": false,
                          "debug": false,
                          "newestOnTop": true,
                          "progressBar": false,
                          "positionClass": "toast-top-full-width",
                          "preventDuplicates": false,
                          "onclick": null,
                          "showDuration": "300",
                          "hideDuration": "1000",
                          "timeOut": "3000",
                          "extendedTimeOut": "1000",
                          "showEasing": "swing",
                          "hideEasing": "linear",
                          "showMethod": "fadeIn",
                          "hideMethod": "fadeOut"
                        }
                        toastr["success"](data.author + " found out that it was " + data.guessing);
                        $('bdo.yes_answered').parent().detach();
                        $('bdo.no_answered').parent().detach();
                        $('#messages-g').scrollTop($('#messages-g')[0].scrollHeight);
                        $('#messages-q').scrollTop($('#messages-q')[0].scrollHeight);
                        if (data.current_master == my_id_in_room) {
                            my_role_in_room = "master"
                            $("#set_question").prop("disabled", true);
                            $("#set_guessing").prop("disabled", true);
                            $('#current_word').text("Current word: "+data.current_word);
                            $('#current_word').show();
                        } else {
                            $("#set_guessing").prop("disabled", false);
                            $('#current_word').hide();
                            if (data.current_questioner == my_id_in_room) {
                                $("#set_question").prop("disabled", false);
                                my_role_in_room = "questioner"
                            } else {
                                $("#set_question").prop("disabled", true);
                                my_role_in_room = "watcher"
                            }
                        }
                    } else {
                        $('#messages-g').append('<div class="msg-right"><bdo class="no_answered"> Is it ' + data.guessing + "? :" + data.author + '</bdo></div>');
                        if (my_role_in_room == "master"){
                            $("#set_guessing").prop("disabled", true);
                        }
                        else{
                            $("#set_guessing").prop("disabled", false);
                        }
                    }
                    $('#current_role').text("Your current role: " + my_role_in_room);
                    $('#messages-g').scrollTop($('#messages-g')[0].scrollHeight);
                });

                channel.bind('new_player', function(data){
                        toastr.options = {
                          "closeButton": false,
                          "debug": false,
                          "newestOnTop": true,
                          "progressBar": false,
                          "positionClass": "toast-top-left",
                          "preventDuplicates": false,
                          "onclick": null,
                          "showDuration": "300",
                          "hideDuration": "1000",
                          "timeOut": "1500",
                          "extendedTimeOut": "1000",
                          "showEasing": "swing",
                          "hideEasing": "linear",
                          "showMethod": "fadeIn",
                          "hideMethod": "fadeOut"
                        }
                        toastr.success(data.nickname + " " + data.hello_message);
                });

                channel.bind('player_left', function(data){
                    toastr.options = {
                      "closeButton": false,
                      "debug": false,
                      "newestOnTop": true,
                      "progressBar": false,
                      "positionClass": "toast-top-right",
                      "preventDuplicates": false,
                      "onclick": null,
                      "showDuration": "300",
                      "hideDuration": "1000",
                      "timeOut": "1500",
                      "extendedTimeOut": "1000",
                      "showEasing": "swing",
                      "hideEasing": "linear",
                      "showMethod": "fadeIn",
                      "hideMethod": "fadeOut"
                    }
                    toastr["warning"](data.leaver_name + " left the room");
                    if (my_id_in_room > parseInt(data.leaver_id)){
                        my_id_in_room -= 1;
                    }
                    if (my_id_in_room == parseInt(data.current_master)){
                        my_role_in_room = "master";
                    }
                    if (my_id_in_room == parseInt(data.current_questioner)){
                        my_role_in_room = "questioner";
                    }
                    if (my_role_in_room == "master"){
                        $("#set_question").prop("disabled", true);
                        $("#set_guessing").prop("disabled", true);
                        $('#current_word').text("Current word: "+data.current_word);
                        $('#current_word').show();
                    }
                    else{
                        if (my_role_in_room == "questioner"){
                            $("#set_question").prop("disabled", false);
                            $("#set_guessing").prop("disabled", false);
                        }
                        else{
                            $("#set_question").prop("disabled", true);
                            $("#set_guessing").prop("disabled", false);
                        }
                    }
                    $('#current_role').text("Your current role: " + my_role_in_room);
                });
                })
            .catch(function(){
                console.log("error in initializing id in room");
            });
});

$(document).ready(function() {
    $("#set_question").click(function () {
        var question = $('#question_field').val();
        $('#question_field').val('');
        var myHeaders = new Headers({
            'data' : question,
            'act' : 'set_question'
        });
        var myInit = { method: 'GET',
               headers: myHeaders};
        fetch('fetch',myInit)
            .then(function(){

            })
            .catch(function(){
                console.log("error")
            });
        my_role_in_room = "watcher";
        $("#set_question").prop("disabled", true);
    });
});

$(document).ready(function() {
    $("#set_guessing").click(function () {
        var guessing = $('#guessing_field').val();
        $('#guessing_field').val('');
        var myHeaders = new Headers({
            'data' : guessing,
            'act' : 'set_guessing'
        });
        var myInit = { method: 'GET',
               headers: myHeaders};
        fetch('fetch',myInit)
            .then(function(){

            })
            .catch(function(){
                console.log("error")
            });
        $("#set_guessing").prop("disabled", true);

    });
});

$(document).ready(function() {
    $("#master_said_yes").click(function () {
        var myHeaders = new Headers({
            'answer' : 'yes',
            'act' : 'master_answer'
        });
        var myInit = { method: 'GET',
               headers: myHeaders};
        fetch('fetch',myInit)
            .then(function(){
                //console.log("yes clicked");
            })
            .catch(function(){
                console.log("error")
            });
    });
});

$(document).ready(function() {
    $("#master_said_no").click(function () {
        var myHeaders = new Headers({
            'answer' : 'no',
            'act' : 'master_answer'
        });
        var myInit = { method: 'GET',
               headers: myHeaders};
        fetch('fetch',myInit)
            .then(function(){

            })
            .catch(function(){
                console.log("error")
            });
    });
});

$(document).ready( function(){
    $('#question_field').tooltip({'trigger':'focus', 'title': 'English letters or digits only'});
    $('#guessing_field').tooltip({'trigger':'focus', 'title': 'English letters or digits only'});
})
