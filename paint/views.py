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
from django.db.models import Q
#import django.shortcuts


def glossary_list(request):
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
    #request.session.flush()
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
        if Room.objects.filter(room_id=request.session.session_key) is not None:
            room = Room()
            glossary = Glossary.objects.filter(name=request.POST['glossary_name'])
            room.create(glossary[0], request.session.session_key)
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
        current_room_id = request.GET['room_id']
        room = Room.objects.filter(room_id=current_room_id)
        if room.count() == 0:
            return render(request, 'paint/room.html', {'room_id': 'Такой комнаты нет'})
        else:
            room = room[0]
            request.session['room_id'] = current_room_id
            request.session['my_role'] = 'watcher'
            request.session['last_update'] = timezone.now()
            if request.session.get('room_id') is None:
                request.session['my_id_in_room'] = room.add_player()
            elif request.session['room_id'] != current_room_id:
                request.session['my_id_in_room'] = room.add_player()
            elif request.session.get('my_id_in_room') is None:
                request.session['my_id_in_room'] = room.add_player()
            elif request.session['my_id_in_room'] == -1:
                request.session['my_id_in_room'] = room.add_player()
        questions = Message.objects.filter(room_id=current_room_id, aim='question')
        guessings = Message.objects.filter(room_id=current_room_id, aim='guessing')
        return render(request, 'paint/room.html', {'questions': questions, 'guessings': guessings,
                                                   'is_questioner': request.session['my_role'] == 'questioner'})


def fetch_handle(request):
    regex = re.compile('^HTTP_')
    header = dict((regex.sub('', header), value) for (header, value)
         in request.META.items() if header.startswith('HTTP_'))
    #header = json.dumps(room)
    # if request.GET.get('headers') == 'hello':
    #     room = Room.objects.filter(room_id=request.session.session_key)
    #     room = serializers.serialize('json', room, fields=('room_id'))
    # else:
    #     room = json.dumps({'hello': 'hello'})
    #room = serializers.serialize('json', room)
    if header["ACT"] == 'set_question':
        newMess = Message()
        newMess.create(request.session['room_id'], request.session['current_login'], header["DATA"], 'question')
        return HttpResponse(json.dumps({}), content_type='application/json')
    elif header["ACT"] == 'refresh':
        new_message = Message.objects.filter(room_id=session['room_id'], last_update__range=[session['last_update'], timezone.now()])
        room = Room.objects.filter(room_id=request.session['room_id'])[0]
        if room.questioner_id == request.session['my_id_in_room']:
            request.session['my_role'] = 'questioner'
        elif room.master == request.session['my_id_in_room']:
            request.session['my_role'] = 'master'
        else:
            request.session['my_role'] = 'watcher'
        response = {'role': request.session['my_role']}
        #if request.session['my_role'] == 'watcher':
        if new_message.count() != 0:
            new_message = serializers.serialize('json', new_message, fields=('message','aim','response','author','is_new'))
            #вернуть все новые сообщения, роль,
        else:
            #вернуть роль, отсутвие новых сообщений

        #elif request.session['my_role'] == 'questioner':

        #elif request.session['my_role'] == 'master':

    elif header["ACT"] == 'set_guessing':
        newMess = Message()
        newMess.create(request.session['room_id'], request.session['current_login'], header["DATA"], 'guessing')
        if #correct :
            #switch master
            #switch word
            #пометить как correct
            #вернуть коррект
        else:
            #вернуть не коррект


    return HttpResponse(room, content_type='application/json')

# Create your views here.
