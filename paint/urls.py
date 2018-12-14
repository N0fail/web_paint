from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^choose_glossary$', views.glossary_list, name='glossary_list'),
]
