'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/services/api';
import { ProdutoItemForm } from '../components/ProdutoItemForm';
import { validateTokenAndRedirect } from '../../../utils/auth';

export default function ProdutoItensPage() {
  const { id } = useParams();
  const router = useRouter();
  const produtoId = Number(id);
  const empresaId = Number(localStorage.getItem('empresa_id'));
  const token = localStorage.getItem('token_project') || '';

  const [produto, setProduto] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await validateTokenAndRedirect(router);
      if (!isValid) {
        console.log("Token inválido. Redirecionando para a página inicial.");
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    fetchProduto();
    fetchItens();
  }, []);

  const fetchProduto = async () => {
    const { data } = await api.get(`/produto/${empresaId}/${produtoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // const prod = data.find((p: any) => p.id === produtoId);
    setProduto(data);
  };

  const fetchItens = async () => {
    const { data } = await api.get(`/produto_item/${empresaId}/${produtoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setItens(data);
  };

  if (!produto) return <p className="p-8">Carregando produto...</p>;

  return (
    <div className="p-8">
      <button onClick={() => router.back()} className="cursor-pointer text-sm text-gray-600 mb-4 hover:underline">
        ← Voltar para produtos
      </button>
      <h1 className="text-2xl font-bold mb-2">{produto.nome}</h1>
      <p className="mb-4 text-gray-600">Preço: R$ {produto.precoVenda}</p>

      <h2 className="text-xl font-semibold mb-2">Itens do Produto</h2>
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        <ul className="grid grid-cols-2 gap-4 mb-6">
          {itens.map((item) => (
            <li key={item.id} className="bg-white p-4 rounded shadow">
              <p><strong>Código:</strong> {item.codigo}</p>
              <p><strong>Descrição:</strong> {item.descricao}</p>
              <p><strong>Complemento:</strong> {item.complemento}</p>
              <p><strong>GTIN:</strong> {item.codigogtin}</p>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Novo Item
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4">Novo Item</h2>
            <ProdutoItemForm
              produtoId={produtoId}
              empresaId={empresaId}
              token={token}
              onCreated={() => {
                fetchItens();
                setIsModalOpen(false);
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}