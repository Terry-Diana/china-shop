import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

interface Product {
  id: number;
  name: string;
  brand: string;
  category_id: number | null;
  stock: number;
  price: number;
  image_url: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

const AdminInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStock, setUpdatingStock] = useState<number | null>(null);
  const [stockValues, setStockValues] = useState<Record<number, number>>({});
  const [updateSuccess, setUpdateSuccess] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('inventory-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        { data: productsData, error: productsError },
        { data: categoriesData, error: categoriesError }
      ] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name').order('name')
      ]);

      if (productsError) throw productsError;
      if (categoriesError) throw categoriesError;

      setProducts(productsData || []);
      setCategories(categoriesData || []);
      
      // Initialize stock values
      const initialStockValues: Record<number, number> = {};
      productsData?.forEach(product => {
        initialStockValues[product.id] = product.stock;
      });
      setStockValues(initialStockValues);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId: number) => {
    try {
      setUpdatingStock(productId);
      const newStock = stockValues[productId];
      
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(products.map(p => 
        p.id === productId ? { ...p, stock: newStock } : p
      ));

      // Show success indicator
      setUpdateSuccess(productId);
      setTimeout(() => setUpdateSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error updating stock:', error);
      alert(`Failed to update stock: ${error.message}`);
    } finally {
      setUpdatingStock(null);
    }
  };

  const handleStockChange = (productId: number, value: number) => {
    setStockValues(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id?.toString() === selectedCategory;
    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'low' && product.stock <= 10 && product.stock > 0) ||
      (stockFilter === 'out' && product.stock === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const stats = {
    totalProducts: products.length,
    inStock: products.filter(p => p.stock > 0).length,
    lowStock: products.filter(p => p.stock <= 10 && p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-lg font-semibold text-gray-900 mb-2">Failed to load inventory data</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchData} variant="primary">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Monitor and manage your stock levels</p>
        </div>
        <Button
          variant="primary"
          icon={<RefreshCw size={18} />}
          onClick={fetchData}
        >
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: <Package size={24} />,
            color: 'primary',
          },
          {
            title: 'Low Stock Items',
            value: stats.lowStock,
            icon: <AlertTriangle size={24} />,
            color: 'warning',
          },
          {
            title: 'Out of Stock',
            value: stats.outOfStock,
            icon: <TrendingDown size={24} />,
            color: 'error',
          },
          {
            title: 'Well Stocked',
            value: stats.inStock,
            icon: <TrendingUp size={24} />,
            color: 'success',
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 bg-${stat.color}-50 rounded-lg`}>
                <div className={`text-${stat.color}`}>{stat.icon}</div>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-grow max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
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
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Stock Levels</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
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
                    exit={{ opacity: 0 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded object-cover"
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
                            {product.brand}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{product.id.toString().padStart(6, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-50 text-primary">
                        {category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-grow h-2 bg-gray-200 rounded-full mr-2 w-20">
                          <div
                            className={`h-2 rounded-full ${
                              stockValues[product.id] > 10
                                ? 'bg-success'
                                : stockValues[product.id] > 0
                                ? 'bg-warning'
                                : 'bg-error'
                            }`}
                            style={{ width: `${Math.min((stockValues[product.id] / 20) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 min-w-[3rem]">{stockValues[product.id]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        stockValues[product.id] > 10
                          ? 'bg-success-50 text-success'
                          : stockValues[product.id] > 0
                          ? 'bg-warning-50 text-warning'
                          : 'bg-error-50 text-error'
                      }`}>
                        {stockValues[product.id] > 10 ? 'In Stock' : stockValues[product.id] > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <input
                          type="number"
                          min="0"
                          value={stockValues[product.id]}
                          onChange={(e) => {
                            const newStock = parseInt(e.target.value) || 0;
                            handleStockChange(product.id, newStock);
                          }}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <Button 
                          variant={updateSuccess === product.id ? "success" : "outline"}
                          size="sm"
                          onClick={() => updateStock(product.id)}
                          disabled={updatingStock === product.id}
                        >
                          {updatingStock === product.id ? 'Updating...' : 
                           updateSuccess === product.id ? 'Updated!' : 'Update'}
                        </Button>
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
    </div>
  );
};

export default AdminInventory;