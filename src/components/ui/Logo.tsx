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
        className="h-20 w-auto mr-20"
      />
     
    </Link>
  );
};

export default Logo;