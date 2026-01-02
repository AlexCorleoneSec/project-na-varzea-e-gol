import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, MapPin } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const registerSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  isAdult: z.boolean().refine((val) => val === true, {
    message: 'Você precisa ser maior de 18 anos',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAdmin, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate('/dashboard');
      } else {
        navigate('/apostas');
      }
    }
  }, [user, isAdmin, navigate]);

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao entrar',
          description: error.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos'
            : error.message,
        });
      } else {
        toast({
          title: 'Bem-vindo!',
          description: 'Login realizado com sucesso.',
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signUp(data.email, data.password, {
        full_name: data.fullName,
        city: data.city,
      });
      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            variant: 'destructive',
            title: 'E-mail já cadastrado',
            description: 'Este e-mail já está em uso. Tente fazer login.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Erro ao cadastrar',
            description: error.message,
          });
        }
      } else {
        toast({
          title: 'Cadastro realizado!',
          description: 'Sua conta foi criada com sucesso.',
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="w-full max-w-md space-y-8 animate-scale-in">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <Logo size="lg" />
          <h1 className="font-display text-4xl text-primary mt-4 tracking-wider">NA VÁRZEA É GOL</h1>
          <p className="text-muted-foreground mt-2">Jogada de Sorte</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Tabs */}
          <div className="flex mb-6 bg-secondary/30 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md transition-all font-medium ${
                isLogin ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md transition-all font-medium ${
                !isLogin ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 input-glow"
                    {...loginForm.register('email')}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••"
                    className="pl-10 input-glow"
                    {...loginForm.register('password')}
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full btn-primary-glow" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Entrar
              </Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Seu nome completo"
                    className="pl-10 input-glow"
                    {...registerForm.register('fullName')}
                  />
                </div>
                {registerForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 input-glow"
                    {...registerForm.register('email')}
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-city">Cidade</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-city"
                    type="text"
                    placeholder="Sua cidade"
                    className="pl-10 input-glow"
                    {...registerForm.register('city')}
                  />
                </div>
                {registerForm.formState.errors.city && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="••••••"
                    className="pl-10 input-glow"
                    {...registerForm.register('password')}
                  />
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-confirm-password">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-confirm-password"
                    type="password"
                    placeholder="••••••"
                    className="pl-10 input-glow"
                    {...registerForm.register('confirmPassword')}
                  />
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="reg-adult"
                  onCheckedChange={(checked) => registerForm.setValue('isAdult', checked as boolean)}
                />
                <Label htmlFor="reg-adult" className="text-sm leading-tight">
                  Declaro que sou maior de 18 anos e aceito os termos de uso
                </Label>
              </div>
              {registerForm.formState.errors.isAdult && (
                <p className="text-sm text-destructive">{registerForm.formState.errors.isAdult.message}</p>
              )}

              <Button type="submit" className="w-full btn-primary-glow" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Criar Conta
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Prêmio de <span className="text-primary font-bold">R$ 25.000,00</span>
        </p>
      </div>
    </div>
  );
}
