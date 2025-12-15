"""
Serializers for Notes API.
"""
from rest_framework import serializers
from .models import Note, Category, Tag


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_name(self, value):
        """Validate that category name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Category name cannot be empty.")
        return value.strip()
    
    def validate(self, attrs):
        """Validate unique category name per user"""
        user = self.context['request'].user
        name = attrs.get('name')
        
        if name:
            # Check for duplicate name (excluding current instance if updating)
            existing = Category.objects.filter(user=user, name=name)
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            
            if existing.exists():
                raise serializers.ValidationError({
                    'name': ['A category with this name already exists.']
                })
        
        return attrs


class TagSerializer(serializers.ModelSerializer):
    """Serializer for Tag model"""
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate_name(self, value):
        """Validate that tag name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Tag name cannot be empty.")
        return value.strip()
    
    def validate(self, attrs):
        """Validate unique tag name per user"""
        user = self.context['request'].user
        name = attrs.get('name')
        
        if name:
            # Check for duplicate name (excluding current instance if updating)
            existing = Tag.objects.filter(user=user, name=name)
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            
            if existing.exists():
                raise serializers.ValidationError({
                    'name': ['A tag with this name already exists.']
                })
        
        return attrs


class NoteSerializer(serializers.ModelSerializer):
    """Serializer for Note model"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Note
        fields = [
            'id', 'title', 'content', 'category', 'category_id',
            'tags', 'tag_ids', 'source_url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_title(self, value):
        """Validate that title is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()
    
    def validate_content(self, value):
        """Validate that content is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Content cannot be empty.")
        return value.strip()
    
    def validate_category_id(self, value):
        """Validate that category belongs to the user"""
        if value is not None:
            user = self.context['request'].user
            try:
                category = Category.objects.get(pk=value, user=user)
            except Category.DoesNotExist:
                raise serializers.ValidationError("Category not found or does not belong to you.")
        return value
    
    def validate_tag_ids(self, value):
        """Validate that all tags belong to the user"""
        if value:
            user = self.context['request'].user
            tag_ids = set(value)
            user_tags = Tag.objects.filter(user=user, pk__in=tag_ids)
            found_ids = set(user_tags.values_list('pk', flat=True))
            
            if tag_ids != found_ids:
                missing = tag_ids - found_ids
                raise serializers.ValidationError(
                    f"Tags with IDs {missing} not found or do not belong to you."
                )
        return value
    
    def create(self, validated_data):
        """Create a new note"""
        user = self.context['request'].user
        category_id = validated_data.pop('category_id', None)
        tag_ids = validated_data.pop('tag_ids', [])
        
        # Set category if provided (remove user from validated_data if present)
        validated_data.pop('user', None)  # Remove user if somehow present
        if category_id is not None:
            validated_data['category'] = Category.objects.get(pk=category_id, user=user)
        
        # Create note with user
        note = Note.objects.create(user=user, **validated_data)
        
        # Add tags if provided
        if tag_ids:
            tags = Tag.objects.filter(user=user, pk__in=tag_ids)
            note.tags.set(tags)
        
        return note
    
    def update(self, instance, validated_data):
        """Update an existing note"""
        category_id = validated_data.pop('category_id', None)
        tag_ids = validated_data.pop('tag_ids', None)
        
        # Update category if provided
        if category_id is not None:
            if category_id:
                instance.category_id = category_id
            else:
                instance.category = None
        
        # Update tags if provided
        if tag_ids is not None:
            user = self.context['request'].user
            tags = Tag.objects.filter(user=user, pk__in=tag_ids)
            instance.tags.set(tags)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

