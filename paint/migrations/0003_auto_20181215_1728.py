# -*- coding: utf-8 -*-
# Generated by Django 1.11.17 on 2018-12-15 14:28
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('paint', '0002_auto_20181213_2223'),
    ]

    operations = [
        migrations.CreateModel(
            name='Room',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('max_players', models.IntegerField()),
                ('room_id', models.TextField()),
                ('current_master', models.IntegerField()),
                ('current_questioner', models.IntegerField()),
                ('questions_chat', models.TextField()),
                ('guessing_chat', models.TextField()),
                ('current_players_count', models.IntegerField()),
            ],
        ),
        migrations.AlterField(
            model_name='glossary',
            name='name',
            field=models.CharField(max_length=200, unique=True),
        ),
        migrations.AddField(
            model_name='room',
            name='glossary',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='paint.Glossary'),
        ),
    ]
