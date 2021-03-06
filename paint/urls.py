from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^choose_glossary$', views.glossary_list, name='glossary_list'),
    url(r'^login$', views.login, name='login'),
    url(r'^room', views.room, name='room'),
    url(r'^fetch', views.fetch_handle, name='fetch_handle'),
    url(r'^$', views.login_redirect, name='login_redirect')
]
