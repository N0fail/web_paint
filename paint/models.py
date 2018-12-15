from django.db import models


# Create your models here.


class Glossary(models.Model):
    name = models.CharField(unique=True, max_length=200)
    words = models.TextField()

    def publish(self):
        self.save()

    def __str__(self):
        return self.name


class Room(models.Model):
    glossary = models.ForeignKey(Glossary)
    max_players = models.IntegerField()
    #user_sessions = model.TextField()
    room_id = models.TextField()
    current_master = models.IntegerField()
    current_questioner = models.IntegerField()
    questions_chat = models.TextField()
    guessing_chat = models.TextField()
    current_players_count = models.IntegerField()

    def create(self, glossary_id, creator_session, max_players=5):
        self.room_id = creator_session
        self.glossary = glossary_id
        self.current_master = 0
        self.current_questioner = 0;
        self.max_players = max_players
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

    def __str__(self):
        return self.room_id

# class User(models.Model):
#     login = models.CharField(unique=True)
#
#
# class Session(models.Model):
#     key = models.CharField(unique=True)
#     #user = models.Foreignkey(User)
#     expires = models.DateTimeField()


