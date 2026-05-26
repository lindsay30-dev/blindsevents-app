from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Profile
        fields = ['id', 'role', 'phone', 'avatar', 'bio']


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)
    role      = serializers.ChoiceField(
        choices=['organizer', 'participant'],
        write_only=True,
        default='participant'
    )

    class Meta:
        model  = User
        fields = ['username', 'email', 'first_name', 'last_name',
                  'password', 'password2', 'role']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError(
                {'password': 'Les mots de passe ne correspondent pas.'}
            )
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError(
                {'email': 'Cet email est déjà utilisé.'}
            )
        return data

    def create(self, validated_data):
        role = validated_data.pop('role', 'participant')
        validated_data.pop('password2')
        user = User.objects.create_user(
            username   = validated_data['username'],
            email      = validated_data['email'],
            first_name = validated_data.get('first_name', ''),
            last_name  = validated_data.get('last_name', ''),
            password   = validated_data['password'],
        )
        Profile.objects.create(user=user, role=role)
        return user