from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^choose_glossary$', views.glossary_list, name='glossary_list'),
    url(r'^login$', views.login, name='login'),
    url(r'^room', views.room, name='room'),
]
