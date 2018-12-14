from django.db import models


# Create your models here.


class Glossary(models.Model):
    name = models.CharField(max_length=200)
    words = models.TextField()

    def publish(self):
        self.save()

    def __str__(self):
        return self.name
