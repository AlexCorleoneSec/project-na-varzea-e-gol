import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Users, Ticket, Trophy, TrendingUp, LogOut, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface BetWithProfile {
  id: string;
  user_id: string;
  seller_id: string | null;
  numbers: number[];
  order_number: string;
  bet_date: string;
  bet_time: string;
  prize_value: number;
  bet_value: number;
  status: string;
  pdf_url: string | null;
  email_sent: boolean;
  created_at: string;
  profile: Tables<'profiles'> | null;
  seller: Tables<'sellers'> | null;
}

export default function Dashboard() {
  const [bets, setBets] = useState<BetWithProfile[]>([]);
  const [totalBets, setTotalBets] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [todayBets, setTodayBets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const { user, isAdmin, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/apostas');
      return;
    }

    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      // Fetch all bets
      const { data: betsData, count } = await supabase
        .from('bets')
        .select('*, sellers(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      if (betsData) {
        // Fetch profiles for each bet
        const userIds = [...new Set(betsData.map(b => b.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);
        
        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
        
        const betsWithProfiles: BetWithProfile[] = betsData.map(bet => ({
          id: bet.id,
          user_id: bet.user_id,
          seller_id: bet.seller_id,
          numbers: bet.numbers || [],
          order_number: bet.order_number,
          bet_date: bet.bet_date,
          bet_time: bet.bet_time,
          prize_value: bet.prize_value,
          bet_value: bet.bet_value,
          status: bet.status,
          pdf_url: bet.pdf_url,
          email_sent: bet.email_sent,
          created_at: bet.created_at,
          profile: profilesMap.get(bet.user_id) || null,
          seller: bet.sellers || null,
        }));
        
        setBets(betsWithProfiles);
      }
      if (count !== null) {
        setTotalBets(count);
      }

      // Fetch total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (usersCount !== null) {
        setTotalUsers(usersCount);
      }

      // Fetch today's bets
      const today = format(new Date(), 'yyyy-MM-dd');
      const { count: todayCount } = await supabase
        .from('bets')
        .select('*', { count: 'exact', head: true })
        .eq('bet_date', today);
      
      if (todayCount !== null) {
        setTodayBets(todayCount);
      }

      setIsLoading(false);
    };

    if (!authLoading) {
      fetchData();
    }
  }, [user, isAdmin, authLoading, navigate, page]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const filteredBets = bets.filter((bet) => {
    const search = searchTerm.toLowerCase();
    return (
      bet.profile?.full_name?.toLowerCase().includes(search) ||
      bet.profile?.email?.toLowerCase().includes(search) ||
      bet.order_number.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(totalBets / pageSize);

  if (isLoading || authLoading) {
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
              <p className="text-xs text-muted-foreground">Painel Administrativo</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Apostas"
            value={totalBets}
            icon={Ticket}
            trend="up"
            trendValue={`+${todayBets} hoje`}
          />
          <StatCard
            title="Usuários Cadastrados"
            value={totalUsers}
            icon={Users}
          />
          <StatCard
            title="Apostas Hoje"
            value={todayBets}
            icon={TrendingUp}
          />
          <StatCard
            title="Prêmio"
            value="R$ 25.000"
            subtitle="Valor fixo"
            icon={Trophy}
          />
        </div>

        {/* Bets Table */}
        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="font-display text-2xl text-primary">APOSTAS REALIZADAS</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Apostador</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Números</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBets.map((bet) => (
                  <TableRow key={bet.id}>
                    <TableCell className="font-mono font-bold text-primary">
                      {bet.order_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bet.profile?.full_name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{bet.profile?.email || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>{bet.profile?.city || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(bet.numbers || []).map((num) => (
                          <span
                            key={num}
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold"
                          >
                            {num.toString().padStart(2, '0')}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(bet.bet_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{bet.bet_time}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bet.status === 'confirmed'
                          ? 'bg-success/20 text-success'
                          : 'bg-warning/20 text-warning'
                      }`}>
                        {bet.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredBets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma aposta encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
