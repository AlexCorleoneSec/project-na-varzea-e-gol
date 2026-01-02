import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';
import { TicketCard } from '@/components/TicketCard';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Ticket, LogOut } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type BetWithSeller = Tables<'bets'> & {
  sellers: Tables<'sellers'> | null;
};

export default function MeusBilhetes() {
  const [bets, setBets] = useState<BetWithSeller[]>([]);
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBet, setSelectedBet] = useState<BetWithSeller | null>(null);
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // Fetch bets with seller
      const { data: betsData } = await supabase
        .from('bets')
        .select('*, sellers(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (betsData) {
        setBets(betsData as BetWithSeller[]);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h1 className="font-display text-xl text-primary tracking-wide">NA VÁRZEA É GOL</h1>
              <p className="text-xs text-muted-foreground">Meus Bilhetes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/apostas')}>
              <Ticket className="w-4 h-4 mr-2" />
              Nova Aposta
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {selectedBet && profile ? (
          <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
            <Button variant="ghost" onClick={() => setSelectedBet(null)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <TicketCard
              betterName={profile.full_name}
              email={profile.email}
              city={profile.city}
              sellerName={selectedBet.sellers?.name || 'Vendedor Padrão'}
              betCount={bets.indexOf(selectedBet) + 1}
              numbers={selectedBet.numbers || []}
              orderNumber={selectedBet.order_number}
              betDate={selectedBet.bet_date}
              betTime={selectedBet.bet_time}
            />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl text-primary mb-2">MEUS BILHETES</h2>
              <p className="text-muted-foreground">
                Você tem <span className="text-primary font-bold">{bets.length}</span> bilhete(s)
              </p>
            </div>

            {bets.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Você ainda não fez nenhuma aposta</p>
                <Button onClick={() => navigate('/apostas')} className="btn-primary-glow">
                  Fazer Primeira Aposta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bets.map((bet, index) => (
                  <button
                    key={bet.id}
                    onClick={() => setSelectedBet(bet)}
                    className="w-full glass-card p-4 hover:border-primary/50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-display text-lg text-primary">
                        Bilhete #{bet.order_number}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bet.status === 'confirmed' 
                          ? 'bg-success/20 text-success' 
                          : 'bg-warning/20 text-warning'
                      }`}>
                        {bet.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{format(new Date(bet.bet_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      <span>{bet.bet_time}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(bet.numbers || []).slice(0, 5).map((num) => (
                        <span key={num} className="number-ball selected !w-8 !h-8 !text-xs">
                          {num.toString().padStart(2, '0')}
                        </span>
                      ))}
                      {(bet.numbers || []).length > 5 && (
                        <span className="number-ball !w-8 !h-8 !text-xs">
                          +{(bet.numbers || []).length - 5}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
