import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';

interface SignUpFormProps {
  onSubmit: (email: string, password: string, name: string) => Promise<void>;
  loading: boolean;
}

export const SignUpForm = ({ onSubmit, loading }: SignUpFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password, name);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name" className="text-foreground font-medium">Nome completo</Label>
        <Input
          id="signup-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-border focus:border-primary rounded-lg h-12"
          placeholder="Seu nome completo"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-foreground font-medium">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-border focus:border-primary rounded-lg h-12"
          placeholder="seu@email.com"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-foreground font-medium">Senha</Label>
        <Input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-border focus:border-primary rounded-lg h-12"
          placeholder="••••••••"
          required
          minLength={6}
        />
      </div>
      
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 h-12 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
};