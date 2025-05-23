import { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, ChevronDown, Search } from 'lucide-react';
import Button from '../components/ui/Button';

interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  hours: string;
  coordinates: [number, number];
  services: string[];
}

const mockStores: Store[] = [
  {
    id: 1,
    name: "ShopVista Downtown",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    phone: "(212) 555-0123",
    hours: "Mon-Sat: 9AM-9PM, Sun: 10AM-7PM",
    coordinates: [40.7128, -74.0060],
    services: ["In-store pickup", "Returns", "Tech support"]
  },
  {
    id: 2,
    name: "ShopVista Brooklyn",
    address: "456 Atlantic Avenue",
    city: "Brooklyn",
    state: "NY",
    zipCode: "11217",
    phone: "(718) 555-0124",
    hours: "Mon-Sun: 8AM-10PM",
    coordinates: [40.6782, -73.9442],
    services: ["In-store pickup", "Returns", "Mobile repair"]
  },
  {
    id: 3,
    name: "ShopVista Queens",
    address: "789 Queens Boulevard",
    city: "Queens",
    state: "NY",
    zipCode: "11375",
    phone: "(718) 555-0125",
    hours: "Mon-Sat: 10AM-8PM, Sun: 11AM-6PM",
    coordinates: [40.7282, -73.8731],
    services: ["In-store pickup", "Returns"]
  }
];

const StoreLocator = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [filteredStores, setFilteredStores] = useState(mockStores);

  useEffect(() => {
    document.title = 'Store Locator | ShopVista';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Filter stores based on search query
    const filtered = mockStores.filter(store => 
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.zipCode.includes(searchQuery)
    );
    setFilteredStores(filtered);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Store</h1>
            <p className="text-gray-600">
              Visit us at one of our locations for in-store shopping, pickup, or expert assistance
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter zip code or city"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* Store List */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Store Cards */}
            <div className="space-y-4">
              {filteredStores.map(store => (
                <div
                  key={store.id}
                  className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-colors ${
                    selectedStore?.id === store.id ? 'border-2 border-primary' : ''
                  }`}
                  onClick={() => setSelectedStore(store)}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{store.name}</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <MapPin size={16} className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
                      <div>
                        <p>{store.address}</p>
                        <p>{store.city}, {store.state} {store.zipCode}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone size={16} className="text-gray-400 mr-2" />
                      <p>{store.phone}</p>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock size={16} className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
                      <p>{store.hours}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Available Services:</h4>
                    <div className="flex flex-wrap gap-2">
                      {store.services.map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => window.open(`https://maps.google.com/?q=${store.address},${store.city},${store.state}`, '_blank')}
                    >
                      Get Directions
                    </Button>
                  </div>
                </div>
              ))}

              {filteredStores.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No stores found matching your search.</p>
                </div>
              )}
            </div>

            {/* Map Preview */}
            <div className="bg-white rounded-lg shadow-sm p-4 h-[600px] sticky top-24">
              <div className="h-full bg-gray-100 rounded flex items-center justify-center">
                <div className="text-center p-4">
                  <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Map integration will be implemented here</p>
                  <p className="text-sm text-gray-500 mt-2">Using Google Maps or similar service</p>
                </div>
              </div>
            </div>
          </div>

          {/* Store Features */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Store Features & Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "In-Store Pickup",
                  description: "Order online and pick up at your convenience",
                  icon: <MapPin size={24} className="text-primary" />
                },
                {
                  title: "Expert Assistance",
                  description: "Get help from our knowledgeable staff",
                  icon: <Phone size={24} className="text-primary" />
                },
                {
                  title: "Easy Returns",
                  description: "Hassle-free returns at any location",
                  icon: <ChevronDown size={24} className="text-primary" />
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreLocator;