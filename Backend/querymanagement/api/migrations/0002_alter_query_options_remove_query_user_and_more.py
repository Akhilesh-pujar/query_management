# Generated by Django 5.1.4 on 2024-12-19 09:04

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='query',
            options={'ordering': ['-created_at']},
        ),
        migrations.RemoveField(
            model_name='query',
            name='user',
        ),
        migrations.AlterField(
            model_name='query',
            name='query_to',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='queries', to='api.department'),
        ),
    ]
