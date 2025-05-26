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
        className="h-8 w-auto mr-2"
      />
      <span className="font-bold text-xl tracking-tight text-white">China Square</span>
    </Link>
  );
};

export default Logo;