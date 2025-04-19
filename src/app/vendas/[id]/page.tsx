'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import Select from 'react-select';
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
  const [buscaProduto, setBuscaProduto] = useState<string>(''); // Campo de busca
  const [produtoFiltrado, setProdutoFiltrado] = useState<any[]>([]); // Produtos filtrados


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

    const fetchProdutoItems = async () => {
      const empresaId = localStorage.getItem('empresa_id');
      const token = localStorage.getItem('token_project');

      if (!empresaId || !token) return;

      try {
        const { data } = await api.get(`/produto_item/${empresaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Retorno da API /produto_item:', data); // Verifique o formato dos dados

        if (Array.isArray(data)) {
          setProdutos(data); // Atualiza o estado `produtos` com os produtoItem
          setProdutoFiltrado(data); // Inicializa os produtos filtrados
        } else {
          console.error('Erro: O retorno da API não é uma lista de produtoItem.');
          setProdutos([]);
          setProdutoFiltrado([]);
        }
      } catch (err) {
        console.error('Erro ao buscar produtoItem:', err);
      }
    };

    fetchVenda();
    fetchProdutoItems();
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

      console.log('Payload para adicionar item:', payload); // Verifique o payload antes de enviar

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

  const handleProdutoChange = (codigo: string) => {
    const produtoSelecionado = produtos.find((produto) => produto.codigo === codigo);
    if (produtoSelecionado) {
      setProdutoItemId(produtoSelecionado.codigo); // Define o código do produtoItem
      setValorUnitario(Number(produtoSelecionado.produto.precoVenda)); // Usa o preço do produto associado
      setValorTotal(Number(produtoSelecionado.produto.precoVenda) * quantidade - desconto);
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

  const handleBuscaProduto = (busca: string) => {
    setBuscaProduto(busca);

    // Certifique-se de que `produtos` é uma lista válida antes de aplicar o filtro
    if (Array.isArray(produtos)) {
      const produtosFiltrados = produtos.filter(
        (produto: any) =>
          produto.nome?.toLowerCase().includes(busca.toLowerCase()) || // Verifica o nome
          produto.codigo?.toString().includes(busca) // Verifica o código
      );
      setProdutoFiltrado(produtosFiltrados); // Atualiza os produtos filtrados
    } else {
      console.error('Erro: `produtos` não é uma lista válida.');
      setProdutoFiltrado([]); // Define uma lista vazia caso `produtos` não seja válido
    }
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
        <div className="bg-gray-100 p-4 rounded shadow mb-6">
          <h2 className="text-lg font-bold mb-2">Informações da Venda</h2>
          <div className="flex gap-8">
            <p>
              <strong>Cliente:</strong> {vendaDetalhada?.cliente?.nome || 'Não informado'}
            </p>
            <p>
              <strong>Valor Total:</strong> R$ {Number(vendaDetalhada?.valor_total || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {vendaDetalhada?.finalizada === false && (
          <form onSubmit={handleAddItem} className="bg-white p-6 rounded shadow mb-6 grid grid-cols-2 gap-4">
            <h2 className="text-lg font-bold col-span-2">Adicionar Item</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Produto (buscar por nome ou código)</label>
              <Select
                options={produtos.map((produto) => ({
                  value: produto.codigo,
                  label: `${produto.produto.nome} - ${produto.codigo}`,
                  produto,
                }))}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    const produtoSelecionado = selectedOption.produto;
                    setProdutoItemId(produtoSelecionado.codigo);
                    const preco = Number(produtoSelecionado.produto.precoVenda);
                    setValorUnitario(preco);
                    setValorTotal(preco * quantidade - desconto);
                  }
                }}
                placeholder="Digite o nome ou código"
                isSearchable
                className="mt-1"
              />
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
                <strong>Produto:</strong> {item.produtoItem.produto.nome} - {item.produtoItem.codigo}
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