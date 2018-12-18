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

$(document).ready(setInterval(function refresh(){
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
            $('#current_role').text("Your current role: " + response[2]['role']);
            if (response[2]['role'] == 'master'){
                $('#current_word').text(response[1]['current_word']);
                $('#current_word').show();
                //$('#set_question').hide();
                //$('#set_guessing').hide();
                $("#set_question").prop("disabled", true);
                $("#set_guessing").prop("disabled", true);
                //console.log('im master')
            }
            else if (response[2]['role'] == 'questioner'){
                if (response[0]['all_answered'] == 'True') {
                    //$('#set_question').show();
                    $("#set_question").prop("disabled", false);
                }
                else{
                    //$('#set_question').hide();
                    $("#set_question").prop("disabled", true);
                }
                $('#current_word').hide();
                //$('#set_guessing').show();
                $("#set_guessing").prop("disabled", false);
                //console.log('im qestioner')
            }
            else if (response[2]['role'] == 'watcher'){
                $('#current_word').hide();
                //$('#set_question').hide();
                $("#set_question").prop("disabled", true);
                //$('#set_guessing').show();
                $("#set_guessing").prop("disabled", false);
                //console.log('im watcher')
            }

            //отобразить новые messages questions - слева suggessions - справа
            for (var i = 3; i < response.length; i++){
                var obj = response[i];
                if (obj.fields['aim'] == 'question'){
                    //console.log(obj.fields['response'])
                    if (obj.fields['response'] == 'no_response') {
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
                    if (obj.fields['response'] == 'correct') {
                        $('#messages-g').append('<div class="msg-right yes_answered"><bdo> Is it ' + obj.fields['message'] + "? :" + obj.fields['author'] + '</bdo></div>');
                    }
                    else{
                        $('#messages-g').append('<div class="msg-right no_answered"><bdo> Is it ' + obj.fields['message'] + "? :" + obj.fields['author'] + '</bdo></div>');
                    }

                }
            }
            $('#messages-q').scrollTop($('#messages-q')[0].scrollHeight);
            $('#messages-g').scrollTop($('#messages-g')[0].scrollHeight);
        })
        .catch(function() {
            console.log('error')
        })
}, 500));

$(document).ready( function(){
    $('#question_field').tooltip({'trigger':'focus', 'title': 'English letters or digits only'});
    $('#guessing_field').tooltip({'trigger':'focus', 'title': 'English letters or digits only'});
})
