# Generated by Django 5.1.4 on 2024-12-18 12:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_department_query_to_id_alter_department_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='mobile_otp',
            field=models.CharField(blank=True, max_length=6, null=True),
        ),
    ]