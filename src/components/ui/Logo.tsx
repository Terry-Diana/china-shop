import { ShoppingBag } from 'lucide-react';

interface LogoProps {
  className?: string;
}

const Logo = ({ className = '' }: LogoProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      <ShoppingBag className="text-accent mr-2" size={28} />
      <span className="font-bold text-xl tracking-tight text-white">China Square</span>
    </div>
  );
};

export default Logo;