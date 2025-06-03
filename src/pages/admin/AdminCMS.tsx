// pages/admin/AdminCMS.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutTemplate, 
  Plus, 
  Trash2, 
  Edit2, 
  Save,
  X,
  Image as ImageIcon
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useConfirm } from '../../hooks/useConfirm';

// Mock CMS data structure
interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
}

const AdminCMS = () => {
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { confirmAction } = useConfirm();

  // Load mock data on mount
  useEffect(() => {
    setPages([
      {
        id: '1',
        title: 'Homepage',
        slug: '/',
        content: '<h1>Welcome to our store</h1><p>Discover amazing products...</p>',
        isPublished: true
      },
      {
        id: '2',
        title: 'About Us',
        slug: '/about',
        content: '<h1>Our Story</h1><p>Founded in 2020...</p>',
        isPublished: true
      },
      {
        id: '3',
        title: 'Contact',
        slug: '/contact',
        content: '<h1>Get in Touch</h1><p>Email: info@example.com...</p>',
        isPublished: false
      }
    ]);
  }, []);

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPage({
      id: 'new',
      title: '',
      slug: '',
      content: '',
      isPublished: true
    });
  };

  const handleEdit = (page: CMSPage) => {
    setEditingPage(page);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirmAction(
      'Delete Page?',
      'Are you sure you want to delete this page? This action cannot be undone.'
    );
    
    if (isConfirmed) {
      setPages(pages.filter(page => page.id !== id));
      if (editingPage?.id === id) setEditingPage(null);
    }
  };

  const handleSave = () => {
    if (!editingPage) return;

    if (editingPage.id === 'new') {
      // Add new page
      setPages([...pages, {
        ...editingPage,
        id: `page-${Date.now()}`,
        slug: editingPage.slug || editingPage.title.toLowerCase().replace(/\s+/g, '-')
      }]);
      setIsCreating(false);
    } else {
      // Update existing page
      setPages(pages.map(page => 
        page.id === editingPage.id ? editingPage : page
      ));
    }
    
    setEditingPage(null);
  };

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Create and manage website pages</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={handleCreate}
        >
          Create Page
        </Button>
      </div>

      {/* CMS Editor Modal */}
      {(editingPage || isCreating) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {isCreating ? 'Create New Page' : 'Edit Page'}
                </h2>
                <button 
                  onClick={() => {
                    setEditingPage(null);
                    setIsCreating(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={editingPage?.title || ''}
                    onChange={(e) => editingPage && setEditingPage({
                      ...editingPage,
                      title: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Page Title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                      /
                    </span>
                    <input
                      type="text"
                      value={editingPage?.slug || ''}
                      onChange={(e) => editingPage && setEditingPage({
                        ...editingPage,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                      })}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="page-slug"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={editingPage?.content || ''}
                    onChange={(e) => editingPage && setEditingPage({
                      ...editingPage,
                      content: e.target.value
                    })}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter HTML content..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use HTML tags to format your content
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="publish"
                    checked={editingPage?.isPublished || false}
                    onChange={(e) => editingPage && setEditingPage({
                      ...editingPage,
                      isPublished: e.target.checked
                    })}
                    className="h-4 w-4 text-primary rounded focus:ring-primary"
                  />
                  <label htmlFor="publish" className="ml-2 text-sm text-gray-700">
                    Publish this page
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingPage(null);
                    setIsCreating(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  icon={<Save size={18} />}
                  onClick={handleSave}
                >
                  Save Page
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <LayoutTemplate 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={20} 
          />
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
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
              {filteredPages.length > 0 ? (
                filteredPages.map((page) => (
                  <motion.tr
                    key={page.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {page.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      /{page.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        page.isPublished
                          ? 'bg-success-50 text-success'
                          : 'bg-warning-50 text-warning'
                      }`}>
                        {page.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(page)}
                        className="text-primary hover:text-primary-dark mr-3"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(page.id)}
                        className="text-error hover:text-error-dark"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No pages found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCMS;