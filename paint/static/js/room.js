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
        $('#messages-q').append('<div class="msg-left">' + question + '? </div>')
        $('#set_question').hide();
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
           //перерисовать html в соответсвии с ролью
           //отобразить новые messages questions - слева suggessions - справа
        });
}, 2000));

//обработчик отправки догадки
//если верно, отключить html взаимодействия и ждать след. рефреш
//иначе ничего