# -*- coding: utf-8 -*-
# Generated by Django 1.11.17 on 2018-12-17 18:28
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('paint', '0016_auto_20181217_2043'),
    ]

    operations = [
        migrations.AlterField(
            model_name='room',
            name='glossary',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='paint.Glossary'),
        ),
    ]
