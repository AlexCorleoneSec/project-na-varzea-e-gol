import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';

interface NumberSelectorProps {
  maxNumbers?: number;
  totalNumbers?: number;
  selectedNumbers: number[];
  onNumbersChange: (numbers: number[]) => void;
}

export function NumberSelector({
  maxNumbers = 10,
  totalNumbers = 100,
  selectedNumbers,
  onNumbersChange,
}: NumberSelectorProps) {
  const handleNumberClick = (num: number) => {
    if (selectedNumbers.includes(num)) {
      onNumbersChange(selectedNumbers.filter((n) => n !== num));
    } else if (selectedNumbers.length < maxNumbers) {
      onNumbersChange([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleRandomSelect = () => {
    const available = Array.from({ length: totalNumbers }, (_, i) => i + 1);
    const shuffled = available.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, maxNumbers).sort((a, b) => a - b);
    onNumbersChange(selected);
  };

  const handleClear = () => {
    onNumbersChange([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Selecionados: <span className="text-primary font-bold">{selectedNumbers.length}</span> de {maxNumbers}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={selectedNumbers.length === 0}
          >
            Limpar
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleRandomSelect}
            className="btn-primary-glow"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Aleatório
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-2 p-4 rounded-xl bg-secondary/20">
        {Array.from({ length: totalNumbers }, (_, i) => i + 1).map((num) => {
          const isSelected = selectedNumbers.includes(num);
          const isDisabled = !isSelected && selectedNumbers.length >= maxNumbers;

          return (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberClick(num)}
              disabled={isDisabled}
              className={`number-ball ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
            >
              {num.toString().padStart(2, '0')}
            </button>
          );
        })}
      </div>

      {selectedNumbers.length > 0 && (
        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">Seus números:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedNumbers.map((num) => (
              <span
                key={num}
                className="number-ball selected !w-10 !h-10 !text-sm"
              >
                {num.toString().padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
