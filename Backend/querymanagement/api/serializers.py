from rest_framework import serializers
from .models import User, Query, QueryHistory, CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'phone_number', 'user_type', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            phone_number=validated_data.get('phone_number'),
            user_type=validated_data.get('user_type', 'user')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
class QuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Query
        fields = "__all__"

class QueryHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QueryHistory
        fields = "__all__"

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = "__all__"

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user