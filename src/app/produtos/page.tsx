'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { validateTokenAndRedirect } from '../../utils/auth';

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [fabricantes, setFabricantes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [fabricanteId, setFabricanteId] = useState('');
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
      fetchProdutos(pageNumber);
    }
  }, [empresaId, token, pageNumber]);

  useEffect(() => {
    const fetchFabricantes = async () => {
      if (!empresaId || !token) return;

      try {
        const { data } = await api.get(`/fabricante/${empresaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFabricantes(data);
      } catch (err) {
        console.error('Erro ao buscar fabricantes:', err);
      }
    };

    fetchFabricantes();
  }, [empresaId, token]);

  const fetchProdutos = async (page: number) => {
    if (!empresaId || !token) return;

    try {
      const { data } = await api.get(`/produto/${empresaId}?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProdutos(data.data); // Atualiza a lista de produtos
      setTotalPages(Math.ceil(data.total / data.limitNumber)); // Calcula o total de páginas
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    }
  };

  const handleCreateProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaId || !token) return;

    try {
      await api.post(
        '/produto',
        {
          nome,
          precoVenda: parseFloat(precoVenda),
          empresaId: Number(empresaId),
          fabricanteId: Number(fabricanteId),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNome('');
      setPrecoVenda('');
      setFabricanteId('');
      setIsModalOpen(false);
      fetchProdutos(pageNumber); // Atualiza a lista de produtos na página atual
    } catch (err) {
      console.error('Erro ao criar produto:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Novo Produto
      </button>
      <div className="max-h-[65vh] overflow-y-auto pr-2">
        <ul className="space-y-4">
          {produtos.map((produto: any) => (
            <li key={produto.id} className="p-4 bg-white shadow rounded">
              <h2 className="text-lg font-semibold">{produto.nome}</h2>
              <p className="text-gray-600">Estoque: {produto.estoque}</p>
              <p className="text-gray-600">Preço: {produto.precoVenda}</p>
              <Link
                href={`/produtos/${produto.id}`}
                className="cursor-pointer mt-2 inline-block text-blue-600 hover:underline"
              >
                Ver itens
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Paginação */}
      <div className="flex justify-center items-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(pageNumber - 1)}
          disabled={pageNumber === 1}
          className="cursor-pointer px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-gray-700">
          Página {pageNumber} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(pageNumber + 1)}
          disabled={pageNumber === totalPages}
          className="cursor-pointer px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Próxima
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4">Novo Produto</h2>
            <form onSubmit={handleCreateProduto}>
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
                <label className="block text-sm font-medium text-gray-700">Preço de Venda</label>
                <input
                  type="number"
                  step="0.01"
                  value={precoVenda}
                  onChange={(e) => setPrecoVenda(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Fabricante</label>
                <select
                  value={fabricanteId}
                  onChange={(e) => setFabricanteId(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Selecione um fabricante
                  </option>
                  {fabricantes.map((fabricante: any) => (
                    <option key={fabricante.id} value={fabricante.id}>
                      {fabricante.nome}
                    </option>
                  ))}
                </select>
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