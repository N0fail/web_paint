var pusher = new Pusher('ec3b28d1f46d5d2bdea7', {
      cluster: 'eu',
      forceTLS: true
    });
var channel;
var init_complete = false;
var my_id_in_room, my_role_in_room;

$(document).ready( function(){
    var myHeaders = new Headers({
            'act' : 'init'
        });
    var myInit = { method: 'GET',
               headers: myHeaders};
        fetch('fetch',myInit)
            .then(function(response){
                //console.log(response);
                return response.json();
            })
            .then(function(response){
                channel = pusher.subscribe(response["channel_id"]);
                my_id_in_room = response['my_id_in_room'];
                my_role_in_room = response['my_role_in_room'];
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
                    //console.log("my id: " + my_id_in_room);
                    //console.log("master id: " + data.current_master);
                    if (data.current_qustioner == my_id_in_room) {
                        my_role_in_room = "questioner"
                        $('#current_role').text("Your current role: " + my_role_in_room);
                    } else {
                        $("#set_question").prop("disabled", true);
                    }
                    if (my_id_in_room == data.current_master) {
                        //console.log("doljen vilesti vopros");
                        $('#modal_for_master').modal('show');
                        $('#question_for_master').text(data.message + '?');
                    }
                    $('#messages-q').scrollTop($('#messages-q')[0].scrollHeight);
                });
                //console.log("new_question binded")

                channel.bind('question_answered', function (data) {
                    var select_str = 'bdo:contains(' + data.message + ')';

                    if (data.answer == 'yes') {
                        $(select_str).addClass('yes_answered');
                    } else {
                        $(select_str).addClass('no_answered');
                    }
                    //console.log("My_id: " + my_id_in_room)
                    //console.log("current_questioner: " + data.current_questioner)
                    if (data.current_questioner == my_id_in_room) {
                        //**********************
                        //my_role_in_room = 'questioner';
                        //console.log("button")
                        $("#set_question").prop("disabled", false);
                    } else {
                        //console.log("doljno otlu4itca");
                        $("#set_question").prop("disabled", true);
                    }
                });
                //console.log("question_answered binded")

                channel.bind('new_guessing', function (data) {
                    if (data.is_correct) {
                        $('#messages-g').append('<div class="msg-right yes_answered"><bdo> Is it ' + data.guessing + "? :" + data.author + '</bdo></div>');
                        // console.log("current_master: " + data.current_master)
                        // console.log("current_questioner: " + data.current_questioner)
                        // console.log("my_id_in_room: " + my_id_in_room)
                        if (data.current_master == my_id_in_room) {
                            my_role_in_room = "master"
                            $("#set_question").prop("disabled", true);
                            $("#set_guessing").prop("disabled", true);
                            $('#current_word').text(data.current_word);
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
                        $('#messages-g').append('<div class="msg-right no_answered"><bdo> Is it ' + data.guessing + "? :" + data.author + '</bdo></div>');
                        if (my_role_in_room == "master"){
                            $("#set_guessing").prop("disabled", true);
                        }
                        else{
                            $("#set_guessing").prop("disabled", false);
                        }
                    }
                    $('#current_role').text("Your current role: " + my_role_in_room);
                    $('#messages-g').scrollTop($('#messages-q')[0].scrollHeight);
                });
                //console.log("new_guessing binded")

                    //console.log("ini"my_id_in_room);
                })
            .catch(function(){
                console.log("error in initializing id in room");
            });
});

// $(document).ready(function(){
//     if (init_complete) {
//         channel.bind('new_question', function (data) {
//             $('#messages-q').append('<div class="msg-left"><bdo>' + data.author + ": " + data.message + '? </bdo></div>');
//             $('#messages-q').scrollTop($('#messages-q')[0].scrollHeight);
//             //console.log("my id: " + my_id_in_room);
//             //console.log("master id: " + data.current_master);
//             if (data.current_qustioner == my_id_in_room) {
//                 my_role_in_room = "questioner"
//                 $('#current_role').text("Your current role: " + my_role_in_room);
//             } else {
//                 $("#set_question").prop("disabled", true);
//             }
//             if (my_id_in_room == data.current_master) {
//                 //console.log("doljen vilesti vopros");
//                 $('#modal_for_master').modal('show');
//                 $('#question_for_master').text(data.message + '?');
//             }
//             $('#messages-q').scrollTop($('#messages-q')[0].scrollHeight);
//         });
//         console.log("new_question binded")
//     }
// });

// остановился здесь *******************************************
//     сделать:
//     -смену ролей на клиентах при ключевых событиях(отправка вопроса, верное предположение)
//     -отрисовка элементов в зависимости от роли
//     -(полная замена полинга)
//     -*обработка покидания комнаты

// $(document).ready(function(){
//     if (init_complete) {
//         channel.bind('question_answered', function (data) {
//             var select_str = 'bdo:contains(' + data.message + ')';
//
//             if (data.answer == 'yes') {
//                 $(select_str).addClass('yes_answered');
//             } else {
//                 $(select_str).addClass('no_answered');
//             }
//
//             if (data.current_qustioner == my_id_in_room) {
//                 //**********************
//                 //my_role_in_room = 'questioner';
//                 $("#set_question").prop("disabled", false);
//             } else {
//                 //console.log("doljno otlu4itca");
//                 $("#set_question").prop("disabled", true);
//             }
//         });
//         console.log("question_answered binded")
//     }
// });

// $(document).ready(function(){
//     if (init_complete) {
//         channel.bind('new_guessing', function (data) {
//             if (data.is_correct) {
//                 $('#messages-g').append('<div class="msg-right yes_answered"><bdo> Is it ' + data.guessing + "? :" + data.author + '</bdo></div>');
//                 // console.log("current_master: " + data.current_master)
//                 // console.log("current_questioner: " + data.current_questioner)
//                 // console.log("my_id_in_room: " + my_id_in_room)
//                 if (data.current_master == my_id_in_room) {
//                     my_role_in_room = "master"
//                     $("#set_question").prop("disabled", true);
//                     $("#set_guessing").prop("disabled", true);
//                     $('#current_word').text(data.current_word);
//                     $('#current_word').show();
//                 } else {
//                     $("#set_guessing").prop("disabled", false);
//                     $('#current_word').hide();
//                     if (data.current_questioner == my_id_in_room) {
//                         $("#set_question").prop("disabled", false);
//                         my_role_in_room = "questioner"
//                     } else {
//                         $("#set_question").prop("disabled", true);
//                         my_role_in_room = "watcher"
//                     }
//                 }
//             } else {
//                 $('#messages-g').append('<div class="msg-right no_answered"><bdo> Is it ' + data.guessing + "? :" + data.author + '</bdo></div>');
//             }
//             $('#current_role').text("Your current role: " + my_role_in_room);
//             $('#messages-g').scrollTop($('#messages-q')[0].scrollHeight);
//         });
//         console.log("new_guessing binded")
//     }
// });

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
        //$('#set_guessing').hide();
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

// $(document).ready(setInterval(function refresh(){
//     var myHeaders = new Headers({
//         'act': 'refresh'
//     });
//     var myInit = { mehhod: 'GET',
//         headers: myHeaders};
//     fetch('fetch', myInit)
//         .then(function(response){
//              //console.log(response);
//              return response.json()
//          })
//         .then(function(response) {
//             $('#current_role').text("Your current role: " + response[2]['role']);
//             if (response[2]['role'] == 'master'){
//                 $('#current_word').text(response[1]['current_word']);
//                 $('#current_word').show();
//                 //$('#set_question').hide();
//                 //$('#set_guessing').hide();
//                 $("#set_question").prop("disabled", true);
//                 $("#set_guessing").prop("disabled", true);
//                 //console.log('im master')
//             }
//             else if (response[2]['role'] == 'questioner'){
//                 if (response[0]['all_answered'] == 'True') {
//                     //$('#set_question').show();
//                     $("#set_question").prop("disabled", false);
//                 }
//                 else{
//                     //$('#set_question').hide();
//                     $("#set_question").prop("disabled", true);
//                 }
//                 $('#current_word').hide();
//                 //$('#set_guessing').show();
//                 $("#set_guessing").prop("disabled", false);
//                 //console.log('im qestioner')
//             }
//             else if (response[2]['role'] == 'watcher'){
//                 $('#current_word').hide();
//                 //$('#set_question').hide();
//                 $("#set_question").prop("disabled", true);
//                 //$('#set_guessing').show();
//                 $("#set_guessing").prop("disabled", false);
//                 //console.log('im watcher')
//             }
//
//             //отобразить новые messages questions - слева suggessions - справа
//             for (var i = 3; i < response.length; i++){
//                 var obj = response[i];
//                 if (obj.fields['aim'] == 'question'){
//                     //console.log(obj.fields['response'])
//                     if (obj.fields['response'] == 'no_response') {
//                         //$('#messages-q').append('<div class="msg-left"><bdo>' + obj.fields['author'] + ": " + obj.fields['message'] + '? </bdo></div>');
//                         if (response[2]['role'] == 'master') {
//                             $('#modal_for_master').modal('show');
//                             $('#question_for_master').text(obj.fields['message'] + '?');
//                         } else {
//                         }
//                     }
//                     else{
//                         var select_str = 'bdo:contains('+ obj.fields['message'] +')';
//                         if (obj.fields['response'] == 'yes'){
//                             //console.log('yes answered');
//                            // $(select_str).addClass('yes_answered');
//                         }
//                         else{
//                             //$('bdo:contains('+ obj.fields['message'] +')').addClass('no_answered');
//                         }
//                     }
//                 }
//                 else if (obj.fields['aim'] == 'guessing'){
//                     // if (obj.fields['response'] == 'correct') {
//                     //     $('#messages-g').append('<div class="msg-right yes_answered"><bdo> Is it ' + obj.fields['message'] + "? :" + obj.fields['author'] + '</bdo></div>');
//                     // }
//                     // else{
//                     //     $('#messages-g').append('<div class="msg-right no_answered"><bdo> Is it ' + obj.fields['message'] + "? :" + obj.fields['author'] + '</bdo></div>');
//                     // }
//
//                 }
//             }
//             $('#messages-q').scrollTop($('#messages-q')[0].scrollHeight);
//             $('#messages-g').scrollTop($('#messages-g')[0].scrollHeight);
//         })
//         .catch(function() {
//             console.log('error')
//         })
// }, 500));

$(document).ready( function(){
    $('#question_field').tooltip({'trigger':'focus', 'title': 'English letters or digits only'});
    $('#guessing_field').tooltip({'trigger':'focus', 'title': 'English letters or digits only'});
    // var myHeaders = new Headers({
    //         'act' : 'ask_init'
    //     });
    //     var myInit = { method: 'GET',
    //            headers: myHeaders};
    //     fetch('fetch',myInit)
    //         .then(function(){
    //
    //         })
    //         .catch(function(){
    //             console.log("error")
    //         });
})
