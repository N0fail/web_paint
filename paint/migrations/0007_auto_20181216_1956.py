# -*- coding: utf-8 -*-
# Generated by Django 1.11.17 on 2018-12-16 16:56
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('paint', '0006_auto_20181216_1950'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='response',
            field=models.CharField(default='', max_length=20),
        ),
        migrations.AlterField(
            model_name='room',
            name='glossary',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='paint.Glossary'),
        ),
    ]
