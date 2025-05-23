import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'accent' | 'white';
}

const LoadingSpinner = ({ size = 'md', color = 'primary' }: LoadingSpinnerProps) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colors = {
    primary: 'border-primary',
    accent: 'border-accent',
    white: 'border-white',
  };

  return (
    <div className="flex justify-center items-center p-4">
      <motion.div
        className={`${sizes[size]} border-4 border-t-transparent rounded-full animate-spin ${colors[color]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default LoadingSpinner;