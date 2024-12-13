from rest_framework import serializers
from .models import User, Query, QueryHistory

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"

class QuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Query
        fields = "__all__"

class QueryHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QueryHistory
        fields = "__all__"
