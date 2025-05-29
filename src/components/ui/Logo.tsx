import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
}

const Logo = ({ className = '' }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <img 
        src="/china-square-logo.png" 
        alt="China Square Logo" 
        className="h-16 w-auto"
      />
    </Link>
  );
};

export default Logo;