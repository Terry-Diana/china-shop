import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-gray-50">
      <div className="text-center px-4 py-12">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="primary" icon={<Home size={18} />}>
              Go Home
            </Button>
          </Link>
          <button onClick={() => window.history.back()}>
            <Button variant="outline" icon={<ArrowLeft size={18} />}>
              Go Back
            </Button>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;