from rest_framework import serializers
from .models import User, Query, QueryHistory


from django.contrib.auth import get_user_model
from .models import Query, Department

User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
   

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'contact_number', 'user_type', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        """
        Create and return a new User instance, given the validated data.
        """
        # Remove password from validated_data to prevent it from being set directly
        password = validated_data.pop('password', None)

        # Create user using the custom create_user method from UserManager
        user = User.objects.create_user(
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            email=validated_data.get('email'),
            contact_number=validated_data.get('contact_number'),
            user_type=validated_data.get('user_type', 'Customer'),  # Default to 'Customer' if not specified
            password=password  # Pass password separately to be hashed
        )

        return user

    def update(self, instance, validated_data):
        """
        Update and return an existing User instance, given the validated data.
        """
        # Remove password from validated_data to handle it separately
        password = validated_data.pop('password', None)

        # Update other fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.contact_number = validated_data.get('contact_number', instance.contact_number)
        instance.user_type = validated_data.get('user_type', instance.user_type)

        # If password is provided, set it using set_password to hash it
        if password:
            instance.set_password(password)

        instance.save()
        return instance





# Serializers for Django Rest Framework
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = [ 'name']
class QuerySerializer(serializers.ModelSerializer):
    query_to = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    
    class Meta:
        model = Query
        fields = [
            'query_number',
            'title',
            'subject',
            'query_to',
            'priority',
            'description',
            'attachment',
            'status',
            'created_by',
            'assigned_to',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_query_number(self, value):
        if not value:
            raise serializers.ValidationError("Query number is required")
        if Query.objects.filter(query_number=value).exists():
            raise serializers.ValidationError("Query number already exists")
        return value

    def create(self, validated_data):
        """Override create method to properly create the Query instance."""
        return Query.objects.create(**validated_data)

    def to_representation(self, instance):
        """Customize the output representation"""
        data = super().to_representation(instance)
        if instance.query_to:
            data['query_to'] = instance.query_to.name
        return data


class QueryHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QueryHistory
        fields = '__all__'


class QueryAssignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Query
        fields = ['assigned_to_department']