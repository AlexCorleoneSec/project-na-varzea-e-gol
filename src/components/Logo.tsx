import logo from '@/assets/logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

export function Logo({ className = '', size = 'md' }: LogoProps) {
  return (
    <div className={`relative ${className}`}>
      <img
        src={logo}
        alt="Na Várzea é Gol"
        className={`${sizeClasses[size]} object-contain animate-float`}
      />
    </div>
  );
}
