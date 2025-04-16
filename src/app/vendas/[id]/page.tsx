'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { validateTokenAndRedirect } from '../../../utils/auth';

export default function VendaDetalhadaPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vendaDetalhada, setVendaDetalhada] = useState<any>(null);
  const [produtos, setProdutos] = useState<any[]>([]); // Lista de produtos para o select
  const [produtoItemId, setProdutoItemId] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [valorUnitario, setValorUnitario] = useState<number>(0);
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [desconto, setDesconto] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingItem, setLoadingItem] = useState(false);

  useEffect(() => {
    const fetchVenda = async () => {
      const empresaId = localStorage.getItem('empresa_id');
      const token = localStorage.getItem('token_project');

      if (!empresaId || !token || !id) {
        console.error('Dados ausentes: empresaId, token ou id');
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/venda/${empresaId}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVendaDetalhada(data);
      } catch (err) {
        console.error('Erro ao buscar venda:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProdutos = async () => {
      const empresaId = localStorage.getItem('empresa_id');
      const token = localStorage.getItem('token_project');

      if (!empresaId || !token) return;

      try {
        const { data } = await api.get(`/produto/${empresaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filtra produtos com estoque > 0
        const produtosComEstoque = data.filter((produto: any) => produto.estoque > 0);
        setProdutos(produtosComEstoque);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
      }
    };

    fetchVenda();
    fetchProdutos();
  }, [id]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingItem(true);

    try {
      const empresaId = localStorage.getItem('empresa_id');
      const token = localStorage.getItem('token_project');

      const payload = {
        vendaId: Number(id),
        empresaId: Number(empresaId),
        itens: [
          {
            produtoItemId,
            quantidade,
            valor_unitario: valorUnitario,
            valor_total: valorTotal,
            desconto,
          },
        ],
      };

      await api.post('/venda/item', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Item adicionado com sucesso!');
      setProdutoItemId(null);
      setQuantidade(1);
      setValorUnitario(0);
      setValorTotal(0);
      setDesconto(0);

      // Atualiza os dados da venda
      const empresaIdLocal = localStorage.getItem('empresa_id');
      const { data } = await api.get(`/venda/${empresaIdLocal}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendaDetalhada(data);
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
      alert('Erro ao adicionar item. Tente novamente.');
    } finally {
      setLoadingItem(false);
    }
  };

  const handleProdutoChange = (produtoId: number) => {
    const produtoSelecionado = produtos.find((produto) => produto.id === produtoId);
    if (produtoSelecionado) {
      setProdutoItemId(produtoId);
      setValorUnitario(Number(produtoSelecionado.precoVenda));
      setValorTotal(Number(produtoSelecionado.precoVenda) * quantidade - desconto);
    }
  };

  const handleQuantidadeChange = (quantidade: number) => {
    setQuantidade(quantidade);
    setValorTotal(valorUnitario * quantidade - desconto);
  };

  const handleDescontoChange = (desconto: number) => {
    setDesconto(desconto);
    setValorTotal(valorUnitario * quantidade - desconto);
  };

  const handleRemoveItem = async (vendaItemId: number) => {
    const empresaId = localStorage.getItem('empresa_id');
    const token = localStorage.getItem('token_project');

    try {
      const payload = {
        empresaId: Number(empresaId),
        vendaItemId,
      };

      await api.post('/venda/item/remove', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Item removido com sucesso!');

      // Atualiza os dados da venda
      const { data } = await api.get(`/venda/${empresaId}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendaDetalhada(data);
    } catch (err) {
      console.error('Erro ao remover item:', err);
      alert('Erro ao remover item. Tente novamente.');
    }
  };

  if (loading) {
    return <p className="p-8">Carregando...</p>;
  }

  return (
    <div className="p-8">
      <button onClick={() => router.back()} className="cursor-pointer text-sm text-gray-600 mb-4 hover:underline">
        ← Voltar para vendas
      </button>

      <h1 className="text-2xl font-bold mb-6">Detalhes da Venda</h1>

      <div className="max-h-[70vh] overflow-y-auto">
        {vendaDetalhada?.finalizada === false && (
          <form onSubmit={handleAddItem} className="bg-white p-6 rounded shadow mb-6 grid grid-cols-2 gap-4">
            <h2 className="text-lg font-bold col-span-2">Adicionar Item</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Produto</label>
              <select
                value={produtoItemId || ''}
                onChange={(e) => handleProdutoChange(Number(e.target.value))}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
              >
                <option value="" disabled>
                  Selecione um produto
                </option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} (Estoque: {produto.estoque})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantidade</label>
              <input
                type="number"
                value={quantidade}
                onChange={(e) => handleQuantidadeChange(Number(e.target.value))}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Valor Unitário</label>
              <input
                type="number"
                value={valorUnitario}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm bg-gray-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Desconto</label>
              <input
                type="number"
                value={desconto}
                onChange={(e) => handleDescontoChange(Number(e.target.value))}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Valor Total</label>
              <input
                type="number"
                value={valorTotal}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm bg-gray-100 focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                disabled={loadingItem}
                className="cursor-pointer  w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loadingItem ? 'Adicionando...' : 'Adicionar Item'}
              </button>
            </div>
          </form>
        )}

        <h2 className="text-xl font-bold mb-4">Itens da Venda</h2>
        <ul className="space-y-4">
          {vendaDetalhada?.VendaItem.map((item: any) => (
            <li key={item.id} className="p-4 bg-white rounded shadow">
              <p>
                <strong>Produto:</strong> {item.produtoItem.produto.nome}
              </p>
              <p>
                <strong>Quantidade:</strong> {item.quantidade}
              </p>
              <p>
                <strong>Valor Unitário:</strong> R$ {Number(item.valor_unitario).toFixed(2)}
              </p>
              <p>
                <strong>Valor Total:</strong> R$ {Number(item.valor_total).toFixed(2)}
              </p>
              <p>
                <strong>Desconto:</strong> R$ {Number(item.desconto).toFixed(2)}
              </p>
              {vendaDetalhada?.finalizada === false && (
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="cursor-pointer mt-2 text-red-500 hover:underline"
                >
                  Excluir
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}