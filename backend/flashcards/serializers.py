"""
Flashcard Serializers
FlashcardSetSerializer, FlashcardSerializer, StudySessionSerializer

Created by: Backend Agent
Date: 2025-01-27
"""

from rest_framework import serializers
from .models import FlashcardSet, Flashcard, StudySession
from notes.models import Category


class FlashcardSetSerializer(serializers.ModelSerializer):
    """Serializer for FlashcardSet model"""
    category = serializers.SerializerMethodField()
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        allow_null=True,
        required=False
    )
    card_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = FlashcardSet
        fields = [
            'id', 'name', 'description', 'category', 'category_id',
            'card_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'card_count']

    def get_category(self, obj):
        """Return category data if exists"""
        if obj.category:
            return {
                'id': obj.category.id,
                'name': obj.category.name,
                'color': obj.category.color
            }
        return None

    def validate_category_id(self, value):
        """Ensure category belongs to the current user"""
        if value and value.user != self.context['request'].user:
            raise serializers.ValidationError(
                "Category does not exist or does not belong to you."
            )
        return value


class FlashcardSerializer(serializers.ModelSerializer):
    """Serializer for Flashcard model"""
    
    class Meta:
        model = Flashcard
        fields = [
            'id', 'front', 'back', 'difficulty',
            'ease_factor', 'review_count', 'correct_count',
            'last_studied', 'next_review', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'ease_factor', 'review_count', 'correct_count',
            'last_studied', 'next_review', 'created_at', 'updated_at'
        ]

    def validate_front(self, value):
        """Ensure front is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Front cannot be empty.")
        return value.strip()

    def validate_back(self, value):
        """Ensure back is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Back cannot be empty.")
        return value.strip()


class StudySessionSerializer(serializers.ModelSerializer):
    """Serializer for StudySession model"""
    flashcard_set = serializers.SerializerMethodField()
    flashcard_set_id = serializers.PrimaryKeyRelatedField(
        queryset=FlashcardSet.objects.all(),
        source='flashcard_set',
        write_only=True,
        allow_null=True,
        required=False
    )
    duration = serializers.FloatField(read_only=True)
    accuracy = serializers.FloatField(read_only=True)

    class Meta:
        model = StudySession
        fields = [
            'id', 'user', 'flashcard_set', 'flashcard_set_id', 'mode',
            'started_at', 'ended_at', 'cards_studied', 'cards_correct',
            'duration', 'accuracy'
        ]
        read_only_fields = [
            'id', 'user', 'started_at', 'ended_at', 'duration', 'accuracy'
        ]

    def get_flashcard_set(self, obj):
        """Return flashcard set data if exists"""
        if obj.flashcard_set:
            return {
                'id': obj.flashcard_set.id,
                'name': obj.flashcard_set.name
            }
        return None

    def validate_flashcard_set_id(self, value):
        """Ensure flashcard set belongs to the current user"""
        if value and value.user != self.context['request'].user:
            raise serializers.ValidationError(
                "Flashcard set does not exist or does not belong to you."
            )
        return value

    def validate_cards_correct(self, value):
        """Ensure cards_correct <= cards_studied"""
        cards_studied = self.initial_data.get('cards_studied', 0)
        if value > cards_studied:
            raise serializers.ValidationError(
                "Cards correct cannot exceed cards studied."
            )
        return value

