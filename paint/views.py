from django.shortcuts import render
from .models import Glossary


def glossary_list(request):
    glossarys = Glossary.objects.all()
    return render(request, 'paint/glossary_list.html', {'glossarys': glossarys})

# Create your views here.
