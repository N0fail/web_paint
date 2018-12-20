from django.shortcuts import render, redirect
from .models import Glossary, Room, Message
from django.contrib.auth import authenticate, login
#from .functions import get_session_id
from datetime import datetime, date, time
import json
from django.http import JsonResponse
from django.http import HttpResponse
from django.core import serializers
from django.utils import timezone
import re
import dateutil.parser
from django.db.models import Q
import pusher

pusher_client = pusher.Pusher(
  app_id='675002',
  key='ec3b28d1f46d5d2bdea7',
  secret='125987d0c03375a71505',
  cluster='eu',
  ssl=True
)
#import django.shortcuts


def glossary_list(request):
    if request.method == 'GET':
        if request.session.get('current_login') is None:
            return redirect('./login')
    if request.method == 'POST':
        #current_login = request.POST.dict()#['current_login']
        current_login = request.POST['current_login']  # ['current_login']
        request.session['current_login'] = current_login
    current_login = request.session.get('current_login')
    glossarys = Glossary.objects.all()
    return render(request, 'paint/glossary_list.html', {'glossarys': glossarys, 'current_login': current_login})


def login(request):

    #num_visits = request.session.get('num_visits', 0)
    #request.session['num_visits'] = num_visits + 1
    request.session.flush()
    current_login = request.session.get('current_login', '')
    return render(request, 'paint/login.html', {'current_login': current_login})
    error = ''
    # if request.method == 'POST':
    #     login = request.POST.get('login')
    #     url = request.POST.get('continue', '/')
    #     sessid = get_session_id(login)
    #     response = HttpResponseRedirect(url)
    #     response.set_cookie('sessid', sessid, httponly=True, expires=datetime.now()+timedelta(days=1))
    #     return response


def room(request):
    if request.method == 'POST':
        if Room.objects.filter(room_id=request.session.session_key).count() == 0:
            room = Room()
            glossary = Glossary.objects.filter(name=request.POST['glossary_name'])
            room.create(glossary[0], request.session.session_key)
            #room.set_questioner(1)
        #session['room_id'] = session['csrfmiddlewaretoken']
        #request.method = 'GET'
        #request.GET['room_id'] = request.session.session_key
        #room(request)
        #return redirect('room', room_id=request.session.session_key)
        response = redirect('./room')
        response['Location'] += '?room_id=' + request.session.session_key
        #return redirect('./room', room_id=request.session.session_key)
        return response
    else:
        if request.session.get('current_login') is None:
            return redirect('./login')
        current_room_id = request.GET.get('room_id')
        room = Room.objects.filter(room_id=current_room_id)
        if room.count() == 0:
            return render(request, 'paint/no_room.html', {'room_id': 'Такой комнаты нет'})
        else:
            room = room[0]
            #request.session['room_id'] = current_room_id
            request.session['my_role'] = 'watcher'
            request.session['last_update'] = str(timezone.now())
            if request.session.get('room_id') is None:
                #print('first if')
                request.session['room_id'] = current_room_id
                request.session['my_id_in_room'] = room.add_player()
            elif request.session['room_id'] != current_room_id:
                #print('second if')
                request.session['room_id'] = current_room_id
                request.session['my_id_in_room'] = room.add_player()
            elif request.session.get('my_id_in_room', None) is None:
                #print('third if')
                request.session['my_id_in_room'] = room.add_player()
            elif request.session['my_id_in_room'] == -1:
                #print('fourth if')
                request.session['my_id_in_room'] = room.add_player()
            #elif request.session.get('left') is None


            if room.current_master == request.session['my_id_in_room']:
                request.session['my_role'] = 'master'
            elif room.current_questioner == request.session['my_id_in_room']:
                request.session['my_role'] = 'questioner'


        questions = Message.objects.filter(room_id=current_room_id, aim='question')
        guessings = Message.objects.filter(room_id=current_room_id, aim='guessing')
        return render(request, 'paint/room.html', {'questions': questions, 'guessings': guessings,
                                                   'current_word': room.current_word,
                                                   'current_login': request.session['current_login'],
                                                   'current_role': request.session['my_role']})


def fetch_handle(request):
    regex = re.compile('^HTTP_')
    header = dict((regex.sub('', header), value) for (header, value)
         in request.META.items() if header.startswith('HTTP_'))

    if header["ACT"] == 'set_question':
        newMess = Message()
        newMess.create(request.session['room_id'], request.session['current_login'], header["DATA"], 'question')
        room = Room.objects.filter(room_id=request.session['room_id'])[0]
        room.switch_questioner()
        room.set_all_answered(False)
        pusher_client.trigger(request.session["room_id"], 'new_question',
                              {'message': header["DATA"], 'author': request.session['current_login'],
                               'current_questioner': room.current_questioner, 'current_master': room.current_master})
        return HttpResponse(json.dumps({}), content_type='application/json')

    # elif header["ACT"] == 'refresh':
    #
    #     last_update = dateutil.parser.parse(request.session['last_update'])
    #     new_message = Message.objects.filter(room_id=request.session['room_id'], last_update__range=[last_update, timezone.now()])
    #     request.session['last_update'] = str(timezone.now())
    #
    #     room = Room.objects.filter(room_id=request.session['room_id'])[0]
    #     if room.current_questioner == request.session['my_id_in_room']:
    #         request.session['my_role'] = 'questioner'
    #     elif room.current_master == request.session['my_id_in_room']:
    #         request.session['my_role'] = 'master'
    #     else:
    #         request.session['my_role'] = 'watcher'
    #
    #     if new_message.count() != 0:
    #         new_message = serializers.serialize('json', new_message, fields=('message', 'aim', 'response', 'author'))
    #         new_message = '[{"role": "' + request.session['my_role'] + '"},' + new_message[1:]
    #     else:
    #         new_message = '[]'
    #         new_message = '[{"role": "' + request.session['my_role'] + '"}' + new_message[1:]
    #
    #     new_message = '[{"current_word": "' + room.current_word + '"},' + new_message[1:]
    #     new_message = '[{"all_answered": "' + str(room.all_answered) + '"},' + new_message[1:]
    #     return HttpResponse(new_message, content_type='application/json')

    elif header["ACT"] == 'set_guessing':
        newMess = Message()
        newMess.create(request.session['room_id'], request.session['current_login'], header["DATA"], 'guessing')
        room = Room.objects.filter(room_id=request.session['room_id'])[0]
        if room.current_word == header["DATA"]:
            newMess.set_response("correct")
            room.switch_master()
            room.switch_current_word()
            newMess.response = 'correct'
            response = '{"is_correct": "correct"}'
            pusher_client.trigger(request.session["room_id"], 'new_guessing',
                                  {'is_correct': True, 'guessing': header["DATA"],
                                   'author': request.session['current_login'], 'current_master': room.current_master,
                                   'current_word': room.current_word, 'current_questioner': room.current_questioner})
        else:
            newMess.set_response("incorrect")
            response = '{"is_correct": "incorrect"}'
            pusher_client.trigger(request.session["room_id"], 'new_guessing',
                                  {'is_correct': False, 'guessing': header["DATA"],
                                   'author': request.session['current_login'], 'current_master': room.current_master,
                                   'current_word': room.current_word, 'current_questioner': room.current_questioner})
        return HttpResponse(response, content_type='application/json')

    elif header["ACT"] == 'master_answer':
        message = Message.objects.get(room_id=request.session['room_id'], aim="question", response="no_response")
        room = Room.objects.get(room_id=request.session['room_id'])
        room.set_all_answered(True)
        message.set_response(header["ANSWER"])
        pusher_client.trigger(request.session["room_id"], 'question_answered',
                              {'answer': header["ANSWER"], 'message': message.message,
                               'current_questioner': room.current_questioner})
        return HttpResponse(json.dumps({}), content_type='application/json')

    elif header["ACT"] == 'init':
        #pusher_client.trigger(request.session["room_id"], '')
        return HttpResponse(json.dumps({'my_id_in_room': request.session['my_id_in_room'],
                                        'my_role_in_room': request.session['my_role'],
                                        'channel_id': request.session["room_id"]}), content_type='application/json')

    return HttpResponse(room, content_type='application/json')


def login_redirect(request):
    return redirect('/login')
# Create your views here.
