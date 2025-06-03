import { useState } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Upload, Edit2, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import Button from '../../components/ui/Button';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  active: boolean;
}

const AdminCMS = () => {
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: '1',
      title: 'Summer Sale',
      subtitle: 'Up to 50% off on selected items',
      image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg',
      link: '/products?filter=sale',
      active: true,
    },
    {
      id: '2',
      title: 'New Arrivals',
      subtitle: 'Check out our latest collection',
      image: 'https://images.pexels.com/photos/4482900/pexels-photo-4482900.jpeg',
      link: '/products?filter=new',
      active: true,
    },
  ]);

  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [showBannerForm, setShowBannerForm] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBanners(items);
  };

  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle banner save logic
    setShowBannerForm(false);
  };
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>

          <p className="text-gray-600">Manage your website content and banners</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => {
            setSelectedBanner(null);
            setShowBannerForm(true);
          }}
        >
          Add Banner
        </Button>
      </div>

      {/* Banner List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Homepage Banners</h2>
          <p className="text-sm text-gray-600">Drag and drop to reorder banners</p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="banners">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="p-4"
              >
                {banners.map((banner, index) => (
                  <Draggable
                    key={banner.id}
                    draggableId={banner.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center"
                      >
                        <div className="h-16 w-24 rounded overflow-hidden mr-4">
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-gray-900">
                            {banner.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {banner.subtitle}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedBanner(banner);
                              setShowBannerForm(true);
                            }}
                            className="p-2 text-gray-400 hover:text-primary"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setBanners(banners.filter(b => b.id !== banner.id));
                            }}
                            className="p-2 text-gray-400 hover:text-error"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Banner Form Modal */}
      {showBannerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedBanner ? 'Edit Banner' : 'Add New Banner'}
              </h3>
              <form onSubmit={handleBannerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedBanner?.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedBanner?.subtitle}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedBanner?.link}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <div className="mx-auto w-12 h-12 mb-4 text-gray-400">
                      <ImageIcon size={48} />
                    </div>
                    <p className="text-gray-600">
                      Drag & drop an image here, or click to select
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Recommended size: 1920x600 pixels
                    </p>
                  </div>
                </div>
                <div className="flex items-center mt-6 justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowBannerForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    {selectedBanner ? 'Update Banner' : 'Add Banner'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}


      {/* SEO Settings */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">SEO Settings</h2>
          <p className="text-sm text-gray-600">
            Manage your website's search engine optimization
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="China Square | Better Choices, Better Prices"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Discover quality products at competitive prices..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keywords
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="electronics, home goods, fashion, accessories"
            />
            <p className="text-sm text-gray-500 mt-1">
              Separate keywords with commas
            </p>
          </div>
          <div className="pt-4">
            <Button variant="primary">Save SEO Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCMS;