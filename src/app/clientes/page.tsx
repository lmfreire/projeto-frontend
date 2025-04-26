'use client';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useRouter } from 'next/navigation';
import { validateTokenAndRedirect } from '../../utils/auth';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Acessa o localStorage no lado do cliente
    const storedEmpresaId = localStorage.getItem('empresa_id');
    const storedToken = localStorage.getItem('token_project');
    setEmpresaId(storedEmpresaId);
    setToken(storedToken);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await validateTokenAndRedirect(router);
      if (!isValid) {
        console.log('Token inválido. Redirecionando para a página inicial.');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (empresaId && token) {
      fetchClientes();
    }
  }, [empresaId, token]);

  const fetchClientes = async () => {
    try {
      const { data } = await api.get(`/cliente/${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientes(data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    }
  };

  const handleCreateCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(
        '/cliente',
        {
          empresaId: Number(empresaId),
          nome,
          cpf,
          email,
          endereco,
          telefone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNome('');
      setCpf('');
      setEmail('');
      setEndereco('');
      setTelefone('');
      setIsModalOpen(false);
      fetchClientes(); // Atualiza a lista de clientes
    } catch (err) {
      console.error('Erro ao criar cliente:', err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Novo Cliente
      </button>
      <div className="max-h-[65vh] overflow-y-auto pr-2">
        <ul className="space-y-4">
          {clientes.length > 0 ? (
            clientes.map((cliente: any) => (
              <li key={cliente.id} className="p-4 bg-white shadow rounded">
                <h2 className="text-lg font-semibold">{cliente.nome}</h2>
                <p className="text-gray-600">CPF: {cliente.cpf}</p>
                <p className="text-gray-600">Email: {cliente.email}</p>
                <p className="text-gray-600">Endereço: {cliente.endereco}</p>
                <p className="text-gray-600">Telefone: {cliente.telefone}</p>
              </li>
            ))
          ) : (
            <p className="text-gray-500">Nenhum cliente encontrado.</p>
          )}
        </ul>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4">Novo Cliente</h2>
            <form onSubmit={handleCreateCliente}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">CPF</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Endereço</label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}