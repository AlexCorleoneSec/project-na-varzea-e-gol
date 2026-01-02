import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';
import { NumberSelector } from '@/components/NumberSelector';
import { TicketCard } from '@/components/TicketCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, ArrowLeft, Ticket, LogOut, History } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

const betSchema = z.object({
  numbers: z.array(z.number()).min(1, 'Selecione pelo menos 1 número').max(10, 'Máximo 10 números'),
});

type BetFormData = z.infer<typeof betSchema>;

export default function Apostas() {
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [sellers, setSellers] = useState<Tables<'sellers'>[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string>('');
  const [createdBet, setCreatedBet] = useState<Tables<'bets'> | null>(null);
  const [betCount, setBetCount] = useState(0);
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

      // Fetch sellers
      const { data: sellersData } = await supabase
        .from('sellers')
        .select('*')
        .eq('active', true);
      
      if (sellersData) {
        setSellers(sellersData);
        if (sellersData.length > 0) {
          setSelectedSeller(sellersData[0].id);
        }
      }

      // Fetch bet count
      const { count } = await supabase
        .from('bets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      setBetCount(count || 0);
    };

    fetchData();
  }, [user, navigate]);

  const handleConfirm = () => {
    if (selectedNumbers.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione pelo menos 1 número.',
      });
      return;
    }
    setStep('confirm');
  };

  const handleSubmit = async () => {
    if (!user || !profile) return;

    setIsSubmitting(true);
    try {
      // Generate order number via RPC
      const { data: orderNumber, error: orderError } = await supabase
        .rpc('generate_order_number');

      if (orderError) throw orderError;

      const now = new Date();
      const betTime = format(now, 'HH:mm:ss');

      // Create bet
      const { data: bet, error: betError } = await supabase
        .from('bets')
        .insert({
          user_id: user.id,
          seller_id: selectedSeller || null,
          numbers: selectedNumbers,
          order_number: orderNumber,
          bet_date: format(now, 'yyyy-MM-dd'),
          bet_time: betTime,
          status: 'confirmed',
        })
        .select()
        .single();

      if (betError) throw betError;

      setCreatedBet(bet);
      setBetCount((prev) => prev + 1);
      setStep('success');

      toast({
        title: 'Aposta realizada!',
        description: 'Seu bilhete foi gerado com sucesso.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar aposta',
        description: err.message || 'Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewBet = () => {
    setSelectedNumbers([]);
    setCreatedBet(null);
    setStep('select');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const selectedSellerData = sellers.find((s) => s.id === selectedSeller);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h1 className="font-display text-xl text-primary tracking-wide">NA VÁRZEA É GOL</h1>
              <p className="text-xs text-muted-foreground">Olá, {profile?.full_name || 'Apostador'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/meus-bilhetes')}>
              <History className="w-4 h-4 mr-2" />
              Meus Bilhetes
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {step === 'select' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl text-primary mb-2">FAÇA SUA APOSTA</h2>
              <p className="text-muted-foreground">Selecione até 10 números para concorrer ao prêmio de <span className="text-primary font-bold">R$ 25.000,00</span></p>
            </div>

            <div className="glass-card p-6">
              <NumberSelector
                selectedNumbers={selectedNumbers}
                onNumbersChange={setSelectedNumbers}
              />
            </div>

            {sellers.length > 1 && (
              <div className="glass-card p-6">
                <Label className="mb-3 block">Vendedor</Label>
                <select
                  value={selectedSeller}
                  onChange={(e) => setSelectedSeller(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground"
                >
                  {sellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              onClick={handleConfirm}
              className="w-full btn-primary-glow py-6 text-lg font-display tracking-wider"
              disabled={selectedNumbers.length === 0}
            >
              <Ticket className="w-5 h-5 mr-2" />
              CONFIRMAR NÚMEROS ({selectedNumbers.length})
            </Button>
          </div>
        )}

        {step === 'confirm' && profile && (
          <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
            <Button variant="ghost" onClick={() => setStep('select')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <div className="text-center mb-6">
              <h2 className="font-display text-3xl text-primary mb-2">CONFIRME SUA APOSTA</h2>
              <p className="text-muted-foreground">Verifique os dados antes de finalizar</p>
            </div>

            <TicketCard
              betterName={profile.full_name}
              email={profile.email}
              city={profile.city}
              sellerName={selectedSellerData?.name || 'Vendedor Padrão'}
              betCount={betCount + 1}
              numbers={selectedNumbers}
              orderNumber="-----"
              betDate={format(new Date(), 'yyyy-MM-dd')}
              betTime={format(new Date(), 'HH:mm:ss')}
            />

            <Button
              onClick={handleSubmit}
              className="w-full btn-primary-glow py-6 text-lg font-display tracking-wider"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Check className="w-5 h-5 mr-2" />
              )}
              FINALIZAR APOSTA
            </Button>
          </div>
        )}

        {step === 'success' && createdBet && profile && (
          <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center animate-bounce-in">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-3xl text-primary mb-2">APOSTA CONFIRMADA!</h2>
              <p className="text-muted-foreground">Seu bilhete foi gerado com sucesso</p>
            </div>

            <TicketCard
              betterName={profile.full_name}
              email={profile.email}
              city={profile.city}
              sellerName={selectedSellerData?.name || 'Vendedor Padrão'}
              betCount={betCount}
              numbers={createdBet.numbers || []}
              orderNumber={createdBet.order_number}
              betDate={createdBet.bet_date}
              betTime={createdBet.bet_time}
            />

            <div className="flex gap-3">
              <Button
                onClick={handleNewBet}
                className="flex-1 btn-primary-glow py-4 font-display tracking-wider"
              >
                NOVA APOSTA
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/meus-bilhetes')}
                className="flex-1 py-4"
              >
                MEUS BILHETES
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
