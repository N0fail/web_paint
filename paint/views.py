from django.shortcuts import render, redirect
from .models import Glossary, Room
from django.contrib.auth import authenticate, login
#from .functions import get_session_id
from datetime import datetime, date, time
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
            if request.session.get('room_id') is None:
                request.session['my_id_in_room'] = room.add_player()
            elif request.session['room_id'] != current_room_id:
                request.session['my_id_in_room'] = room.add_player()
            elif request.session.get('my_id_in_room') is None:
                request.session['my_id_in_room'] = room.add_player()
            elif request.session['my_id_in_room'] == -1:
                request.session['my_id_in_room'] = room.add_player()

        return render(request, 'paint/room.html', {'room_id': request.session['my_id_in_room']})


# Create your views here.
