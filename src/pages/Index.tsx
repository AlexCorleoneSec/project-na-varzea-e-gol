import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Loader2, Ticket, Trophy, Users, Star } from 'lucide-react';

export default function Index() {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      if (isAdmin) {
        navigate('/dashboard');
      } else {
        navigate('/apostas');
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-60 h-60 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-8 max-w-2xl animate-fade-in">
          <Logo size="lg" className="mx-auto" />
          
          <div className="space-y-4">
            <h1 className="font-display text-5xl md:text-7xl text-primary tracking-wider">
              NA VÁRZEA É GOL
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Jogada de Sorte
            </p>
          </div>

          {/* Prize Banner */}
          <div className="glass-card p-8 animate-pulse-glow">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-primary" />
              <span className="font-display text-2xl text-muted-foreground">PRÊMIO</span>
            </div>
            <p className="font-display text-5xl md:text-6xl text-gradient">
              R$ 25.000
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 py-8">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Escolha até<br />10 números</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Bilhete digital<br />instantâneo</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Sorteios<br />especiais</p>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={() => navigate('/auth')}
            className="btn-primary-glow py-6 px-12 text-xl font-display tracking-wider"
          >
            <Ticket className="w-6 h-6 mr-3" />
            APOSTAR AGORA
          </Button>

          <p className="text-sm text-muted-foreground">
            Cadastre-se e faça sua aposta para concorrer!
          </p>
        </div>
      </div>
    </div>
  );
}
