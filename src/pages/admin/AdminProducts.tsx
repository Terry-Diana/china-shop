import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import {
  Upload,
  Search,
  Filter,
  Plus,
  Download,
  Edit2,
  Trash2,
  Image as ImageIcon,
  X,
  Eye,
  Package,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import ProductQuickView from '../../components/admin/ProductQuickView';
import { supabase } from '../../lib/supabase';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number | null;
  discount: number;
  category_id: number | null;
  brand: string;
  stock: number;
  rating: number;
  review_count: number;
  is_new: boolean;
  is_best_seller: boolean;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [updateSuccess, setUpdateSuccess] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('products-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, () => {
        console.log('🔄 Products: Real-time update triggered');
        fetchProducts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (fetchError) throw fetchError;
      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setLoading(true);
    
    Papa.parse(file, {
      complete: (results) => {
        console.log('Parsed CSV:', results.data);
        setLoading(false);
        setShowUploadModal(false);
        alert(`Successfully imported ${results.data.length} products!`);
        fetchProducts(); // Refresh products list
      },
      header: true,
      error: (error) => {
        console.error('CSV parsing error:', error);
        setLoading(false);
        alert('Error parsing CSV file. Please check the format.');
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const handleImageDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
    onDrop: handleImageDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
  });

  const filteredProducts = products.filter(product => {
    const category = categories.find(c => c.id === product.category_id);
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        // Return a fallback image URL if upload fails
        return 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg';
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      // Return a fallback image URL if upload fails
      return 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg';
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if user is admin before proceeding
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('You must be logged in as an admin to perform this action');
      }

      // Verify admin status
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (adminError || !adminData) {
        throw new Error('You do not have admin privileges to perform this action');
      }

      const formData = new FormData(e.target as HTMLFormElement);
      
      let imageUrl = selectedProduct?.image_url || 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg';
      
      // Upload image if a new one was selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const productData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        original_price: formData.get('originalPrice') ? parseFloat(formData.get('originalPrice') as string) : null,
        brand: formData.get('brand') as string,
        stock: parseInt(formData.get('stock') as string),
        category_id: formData.get('category') ? parseInt(formData.get('category') as string) : null,
        is_new: formData.get('isNew') === 'on',
        is_best_seller: formData.get('isBestSeller') === 'on',
        image_url: imageUrl,
        slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        discount: 0,
        rating: selectedProduct?.rating || 0,
        review_count: selectedProduct?.review_count || 0
      };

      // Calculate discount
      if (productData.original_price && productData.original_price > productData.price) {
        productData.discount = Math.round(((productData.original_price - productData.price) / productData.original_price) * 100);
      }

      console.log('Submitting product data:', productData);

      if (selectedProduct) {
        // Update existing product
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', selectedProduct.id)
          .select()
          .single();

        if (error) {
          console.error('Product update error:', error);
          if (error.message.includes('row-level security')) {
            throw new Error('Access denied. Please ensure you are logged in as an admin.');
          }
          throw new Error(`Failed to update product: ${error.message}`);
        }
        
        // Show success indicator
        setUpdateSuccess(selectedProduct.id);
        setTimeout(() => setUpdateSuccess(null), 3000);
        
        alert('Product updated successfully!');
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) {
          console.error('Product creation error:', error);
          if (error.message.includes('row-level security')) {
            throw new Error('Access denied. Please ensure you are logged in as an admin.');
          }
          throw new Error(`Failed to create product: ${error.message}`);
        }
        
        if (data) {
          // Show success indicator
          setUpdateSuccess(data.id);
          setTimeout(() => setUpdateSuccess(null), 3000);
        }
        
        alert('Product created successfully!');
      }
      
      setShowProductForm(false);
      setSelectedProduct(null);
      setImageFile(null);
      setImagePreview('');
      await fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      setError(error.message || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      // Check admin privileges
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('You must be logged in as an admin');
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        if (error.message.includes('row-level security')) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw error;
      }

      setProducts(products.filter(p => p.id !== productId));
      alert('Product deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(`Error deleting product: ${error.message}`);
    }
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };

  const handleEditFromQuickView = (product: Product) => {
    setSelectedProduct(product);
    setImagePreview(product.image_url || '');
    setShowQuickView(false);
    setShowProductForm(true);
  };

  const exportProducts = () => {
    if (products.length === 0) {
      alert('No products to export');
      return;
    }

    const csvContent = [
      Object.keys(products[0]).join(','),
      ...products.map(product => Object.values(product).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Show loading only if we're actually loading and have no products yet
  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600">Manage your product catalog and inventory</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            icon={<Upload size={18} />}
            onClick={() => setShowUploadModal(true)}
          >
            Import CSV
          </Button>
          <Button
            variant="outline"
            icon={<Download size={18} />}
            onClick={exportProducts}
          >
            Export
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => {
              setSelectedProduct(null);
              setImageFile(null);
              setImagePreview('');
              setShowProductForm(true);
            }}
          >
            Add Product
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-dark px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Products', value: products.length, icon: <Package size={20} />, color: 'primary' },
          { title: 'In Stock', value: products.filter(p => p.stock > 0).length, icon: <CheckCircle size={20} />, color: 'success' },
          { title: 'Low Stock', value: products.filter(p => p.stock <= 10 && p.stock > 0).length, icon: <AlertTriangle size={20} />, color: 'warning' },
          { title: 'Out of Stock', value: products.filter(p => p.stock === 0).length, icon: <X size={20} />, color: 'error' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-50 rounded-lg`}>
                <div className={`text-${stat.color}`}>{stat.icon}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id.toString()}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const category = categories.find(c => c.id === product.category_id);
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.image_url || 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg'}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: #{product.id.toString().padStart(6, '0')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-50 text-primary">
                        {category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">Ksh {product.price.toFixed(2)}</div>
                      {product.original_price && product.original_price > product.price && (
                        <div className="text-xs text-gray-500 line-through">
                          Ksh {product.original_price.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900 font-medium mr-2">{product.stock}</div>
                        <div className={`w-2 h-2 rounded-full ${
                          product.stock > 10 ? 'bg-success' : 
                          product.stock > 0 ? 'bg-warning' : 'bg-error'
                        }`}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock > 10
                          ? 'bg-success-50 text-success'
                          : product.stock > 0
                          ? 'bg-warning-50 text-warning'
                          : 'bg-error-50 text-error'
                      }`}>
                        {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleQuickView(product)}
                          className="text-gray-400 hover:text-primary transition-colors"
                          title="View Product"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setImagePreview(product.image_url || '');
                            setShowProductForm(true);
                          }}
                          className="text-gray-400 hover:text-primary transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-gray-400 hover:text-error transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => {
                    setShowProductForm(false);
                    setSelectedProduct(null);
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                  disabled={loading}
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter product name"
                      defaultValue={selectedProduct?.name}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand *
                    </label>
                    <input
                      type="text"
                      name="brand"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter brand name"
                      defaultValue={selectedProduct?.brand}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter product description"
                    defaultValue={selectedProduct?.description}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (Ksh) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0.00"
                      defaultValue={selectedProduct?.price}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Price (Ksh)
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0.00"
                      defaultValue={selectedProduct?.original_price || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                      defaultValue={selectedProduct?.stock}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select 
                    name="category"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={selectedProduct?.category_id ||''}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <div 
                    {...getImageRootProps()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer ${
                      isImageDragActive ? 'border-primary bg-primary-50' : 'border-gray-300'
                    }`}
                  >
                    <input {...getImageInputProps()} />
                    
                    {imagePreview || selectedProduct?.image_url ? (
                      <div className="relative">
                        <img 
                          src={imagePreview || selectedProduct?.image_url} 
                          alt="Product preview" 
                          className="h-40 mx-auto object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFile(null);
                            setImagePreview('');
                          }}
                          className="absolute top-0 right-0 bg-error text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-2">
                          Drag & drop product image here, or click to select
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG or GIF, max 2MB
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      name="isNew"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                      defaultChecked={selectedProduct?.is_new}
                    />
                    <span className="ml-2 text-sm text-gray-700">Mark as New</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      name="isBestSeller"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                      defaultChecked={selectedProduct?.is_best_seller}
                    />
                    <span className="ml-2 text-sm text-gray-700">Best Seller</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowProductForm(false);
                      setSelectedProduct(null);
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (selectedProduct ? 'Update Product' : 'Create Product')}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Import Products
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                  disabled={loading}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragActive ? 'border-primary bg-primary-50' : 'border-gray-300 hover:border-primary'
                }`}
              >
                <input {...getInputProps()} />
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                {isDragActive ? (
                  <p className="text-primary font-medium">Drop the CSV file here</p>
                ) : (
                  <>
                    <p className="text-gray-600 mb-2">
                      Drag & drop a CSV file here, or click to select
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported format: .csv (max 10MB)
                    </p>
                  </>
                )}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Include headers: name, price, stock, category, brand</li>
                  <li>• Use comma-separated values</li>
                  <li>• Ensure all required fields are filled</li>
                </ul>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Upload'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Product Quick View Modal */}
      {showQuickView && quickViewProduct && (
        <ProductQuickView 
          product={quickViewProduct} 
          onClose={() => setShowQuickView(false)}
          onEdit={(product) => {
            setSelectedProduct(product);
            setImagePreview(product.image_url || '');
            setShowQuickView(false);
            setShowProductForm(true);
          }}
        />
      )}
    </div>
  );
};

export default AdminProducts;