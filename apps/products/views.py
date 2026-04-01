"""
Product API Views
"""
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for product categories.
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint for products.
    """
    queryset = Product.objects.filter(status='active')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured', 'status']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = Product.objects.filter(status='active')
        
        # Filter by category slug
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        return queryset

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products."""
        featured = Product.objects.filter(is_featured=True, status='active')[:8]
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        """Get new arrival products."""
        new_products = Product.objects.filter(status='active').order_by('-created_at')[:8]
        serializer = self.get_serializer(new_products, many=True)
        return Response(serializer.data)
