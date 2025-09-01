
import { useAuth } from '@/hooks/useAuth';
import { AdminPanel } from '@/components/Admin/AdminPanel';
import { SimpleAuthModal } from '@/components/Auth/SimpleAuthModal';

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <SimpleAuthModal isOpen={true} onClose={() => {}} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Acesso Negado</h1>
          <p className="text-gray-400">Você não tem permissão para acessar esta área.</p>
          <p className="text-gray-500 text-sm mt-4">
            Se você é um administrador, certifique-se de que sua conta tem as permissões corretas.
          </p>
        </div>
      </div>
    );
  }

  return <AdminPanel />;
};

export default Admin;
