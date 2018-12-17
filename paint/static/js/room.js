// $(document).ready(function() {
//     $("button").click(function () {
//         $.ajax({
//            url: 'ajax',
//            type: 'GET',
//         }).success(function(data){
//             if (data.status == 'ok'){
//                 alert("hello");
//             }
//         }).error(function(){
//             console.log('http error');
//             // alert("hello");
//         });
//     });
// });
// $(document).ready(function() {
//     $("button").click(function () {
//         var myHeaders = new Headers({
//             'data' : 'hello'
//         })
//         var myInit = { method: 'GET',
//                headers: myHeaders};
//         fetch('fetch',myInit)
//             // .then((resp)=>resp.json())
//             .then(function(response){
//                 return response.json()
//             })
//             .then(function(json){
//                 // console.log(json[0].fields['room_id'])
//                 console.log(json)
//             })
//             .catch(function(){
//                 alert("error")
//             })
//     });
// });
$(document).ready(function() {
    $("#set_question").click(function () {
        var question = $('#question_field').val();
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
            // .then((resp)=>resp.json())
            // .then(function(response){
            //     return response.json()
            // })
            // .then(function(json){
            //     // console.log(json[0].fields['room_id'])
            //     console.log(json)
            // })
            // .catch(function(){
            //     alert("error")
            // })
        //возможно стоит закоментить, т.к. появится при рефреше
        //$('#messages-q').append('<div class="msg-left">' + question + '? </div>');
        $('#set_question').hide();
    });
});

$(document).ready(function() {
    $("#set_guessing").click(function () {
        var guessing = $('#guessing_field').val();

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
        $('#set_guessing').hide();

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

$(document).ready(setInterval(function(){
    var myHeaders = new Headers({
        'act': 'refresh'
    });
    var myInit = { mehhod: 'GET',
        headers: myHeaders};
    fetch('fetch', myInit)
        .then(function(response){
             //console.log(response);
             return response.json()
         })
        .then(function(response) {
            if (response[2]['role'] == 'master'){
                $('#set_question').hide();
                $('#set_guessing').hide();
                console.log('im master')
                //дописать
            }
            else if (response[2]['role'] == 'questioner'){
                if (response[0]['all_answered'] == 'True') {
                    $('#set_question').show();
                }
                else{
                    $('#set_question').hide();
                }
                $('#set_guessing').show();
                console.log('im qestioner')
            }
            else if (response[2]['role'] == 'watcher'){
                $('#set_question').hide();
                $('#set_guessing').show();
                console.log('im watcher')
            }
            //отобразить новые messages questions - слева suggessions - справа
            for (var i = 3; i < response.length; i++){
                var obj = response[i];
                if (obj.fields['aim'] == 'question'){
                    //console.log(obj.fields['response'])
                    if (obj.fields['response'] == 'no_response') {//если ответили раньше чем появилось, то что???
                        $('#messages-q').append('<div class="msg-left"><bdo>' + obj.fields['author'] + ": " + obj.fields['message'] + '? </bdo></div>');
                        if (response[2]['role'] == 'master') {
                            $('#modal_for_master').modal('show');
                            $('#question_for_master').text(obj.fields['message'] + '?');
                        } else {
                        }
                    }
                    else{
                        var select_str = 'bdo:contains('+ obj.fields['message'] +')';
                        if (obj.fields['response'] == 'yes'){
                            console.log('yes answered');
                            $(select_str).addClass('yes_answered');
                        }
                        else{
                            $('bdo:contains('+ obj.fields['message'] +')').addClass('no_answered');
                        }
                    }
                }
                else if (obj.fields['aim'] == 'guessing'){
                    $('#messages-g').append('<div class="msg-right"><bdo> Это ' + obj.fields['message'] + "? :" + obj.fields['author'] + '</bdo></div>');
                }
            }
            $('#messages-q').scrollTop($('#messages-q')[0].scrollHeight);
            $('#messages-g').scrollTop($('#messages-g')[0].scrollHeight);
        })
        .catch(function() {
            console.log('error')
        })
}, 2000));

//обработчик отправки догадки
//если верно, отключить html взаимодействия и ждать след. рефреш
//иначе ничего