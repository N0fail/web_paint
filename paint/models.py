from django.db import models
from django.utils import timezone
import random

# Create your models here.


class Glossary(models.Model):
    name = models.CharField(unique=True, max_length=200)
    words = models.TextField()

    def publish(self):
        self.save()

    def __str__(self):
        return self.name

    def get_random_word(self):
        string = str(self.words)
        words = string.split(', ')
        return random.choice(words)


class Room(models.Model):
    glossary = models.ForeignKey(Glossary)
    max_players = models.IntegerField()
    room_id = models.TextField()
    current_master = models.IntegerField()
    current_questioner = models.IntegerField()
    current_players_count = models.IntegerField()
    current_word = models.CharField(max_length=40, default='')
    all_answered = models.BooleanField(default=True)

    def create(self, glossary_id, creator_session, max_players=5):
        self.room_id = creator_session
        self.glossary = glossary_id
        self.current_word = self.glossary.get_random_word()
        self.current_master = 0
        self.current_questioner = 0
        self.max_players = max_players
        self.all_answered = True
        self.current_players_count = 0
        self.save()

    def add_player(self):
        #self.user_sessions = self.user_sessions + ', ' + session_id
        if self.current_players_count < self.max_players:
            self.current_players_count += 1
            self.save()
            return self.current_players_count
        else:
            return -1

    def remove_player(self, player_number):
        #self.current_players_count = self.current_players_count - 1
        if player_number == self.current_players_count:
            if player_number == self.current_master:
                self.current_master = 1
            if player_number == self.current_questioner:
                self.current_questioner = 1
        self.current_players_count -= 1
        self.save()

    def set_master(self, player_number):
        self.current_master = player_number
        self.save()

    def set_questioner(self, player_number):
        self.current_questioner = player_number
        self.save()

    def switch_questioner(self):
        self.current_questioner += 1
        if self.current_questioner > self.current_players_count:
            self.current_questioner = 1
        if self.current_questioner == self.current_master:
            self.current_questioner += 1
        self.save()

    def switch_master(self):
        self.current_master += 1
        if self.current_master > self.current_players_count:
            self.current_questioner = 1
        if self.current_questioner == self.current_master:
            self.switch_questioner()
        self.save()

    def switch_current_word(self):
        self.current_word = self.glossary.get_random_word()
        self.save()

    def set_all_answered(self, value):
        self.all_answered = value
        self.save()

    def __str__(self):
        return self.room_id


class Message(models.Model):
    room_id = models.CharField(default='', max_length=70)
    message = models.CharField(max_length=200)
    response = models.CharField(default='no_response', max_length=20)
    author = models.CharField(max_length=30)
    aim = models.CharField(max_length=20)
    #is_new = models.BooleanField(default=True)
    #new_response = models.BooleanField(default=False)
    last_update = models.DateTimeField(auto_now=True)

    def create(self, room_id, author, message, aim):
        self.room_id = room_id
        self.author = author
        self.response = 'no_response'
        self.message = message
        self.aim = aim
        self.last_update = timezone.now()
        #self.is_new = True
        #self.new_response = False
        self.save()

    def set_response(self, response):
        self.response = response
        self.last_update = timezone.now()
        self.save()

    def __str__(self):
        return self.message

# class User(models.Model):
#     login = models.CharField(unique=True)
#
#
# class Session(models.Model):
#     key = models.CharField(unique=True)
#     #user = models.Foreignkey(User)
#     expires = models.DateTimeField()


