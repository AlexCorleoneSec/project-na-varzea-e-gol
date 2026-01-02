import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Logo } from './Logo';

interface TicketCardProps {
  betterName: string;
  email: string;
  city: string;
  sellerName: string;
  betCount: number;
  numbers: number[];
  orderNumber: string;
  betDate: string;
  betTime: string;
  prizeValue?: number;
  betValue?: number;
}

export function TicketCard({
  betterName,
  email,
  city,
  sellerName,
  betCount,
  numbers,
  orderNumber,
  betDate,
  betTime,
  prizeValue = 25000,
  betValue = 25,
}: TicketCardProps) {
  const formattedDate = format(new Date(betDate), 'dd/MM/yyyy', { locale: ptBR });

  return (
    <div className="ticket-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-center gap-4 border-b border-border/30 pb-4">
        <Logo size="sm" />
        <h2 className="font-display text-3xl text-primary tracking-wider">NA VÁRZEA É GOL</h2>
      </div>

      {/* Info Section */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Premiação:</span>
          <span className="font-bold text-primary">R$ {prizeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Apostador:</span>
          <span className="font-medium">{betterName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Qtd Apostas:</span>
          <span>{betCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Vendedor:</span>
          <span>{sellerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cidade:</span>
          <span>{city}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Ordem:</span>
          <span className="font-mono font-bold">{orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Data:</span>
          <span>{formattedDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Horário:</span>
          <span>{betTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Valor:</span>
          <span className="font-bold">R$ {betValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Numbers Section */}
      <div className="bg-background/50 rounded-xl p-4 space-y-3">
        <h4 className="font-display text-lg text-center text-primary tracking-wide">NÚMEROS:</h4>
        <div className="flex flex-wrap justify-center gap-2">
          {numbers.map((num) => (
            <span
              key={num}
              className="number-ball selected !w-10 !h-10 !text-sm"
            >
              {num.toString().padStart(2, '0')}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border/30">
        <p>ID: {orderNumber}-{Date.now().toString(36)}</p>
      </div>
    </div>
  );
}
