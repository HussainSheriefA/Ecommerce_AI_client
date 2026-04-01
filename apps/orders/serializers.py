"""
Orders API Serializers
"""
from rest_framework import serializers
from apps.products.serializers import ProductSerializer
from apps.cart.models import Cart
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items."""
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders."""
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'items',
            'subtotal', 'shipping_cost', 'tax', 'total',
            'shipping_address', 'billing_address',
            'payment_method', 'payment_status',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['order_number', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating orders."""
    shipping_address_id = serializers.IntegerField()
    billing_address_id = serializers.IntegerField(required=False)
    payment_method = serializers.ChoiceField(choices=['cod', 'card', 'upi'])
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        request = self.context['request']
        try:
            cart = Cart.objects.get(user=request.user)
            if not cart.items.exists():
                raise serializers.ValidationError("Cart is empty")
        except Cart.DoesNotExist:
            raise serializers.ValidationError("Cart is empty")
        return data
    
    def create(self, validated_data):
        request = self.context['request']
        cart = Cart.objects.get(user=request.user)
        
        # Create order
        order = Order.objects.create(
            user=request.user,
            shipping_address_id=validated_data['shipping_address_id'],
            billing_address_id=validated_data.get('billing_address_id'),
            payment_method=validated_data['payment_method'],
            notes=validated_data.get('notes', ''),
            subtotal=cart.total_price,
            shipping_cost=0,  # Calculate based on logic
            tax=0,  # Calculate based on logic
            total=cart.total_price
        )
        
        # Create order items from cart
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.current_price
            )
        
        # Clear cart
        cart.items.all().delete()
        
        return order
