"use client";
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);
  const [produtoItens, setProdutoItens] = useState([]);
  const [selectedProduto, setSelectedProduto] = useState<any>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProdutoItensModalOpen, setIsProdutoItensModalOpen] = useState(false);
  const [isCreateProdutoItemModalOpen, setIsCreateProdutoItemModalOpen] = useState(false);

  const [nomeProduto, setNomeProduto] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [fabricanteId, setFabricanteId] = useState("");

  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [complemento, setComplemento] = useState("");
  const [markup, setMarkup] = useState("");
  const [codigogtin, setCodigogtin] = useState("");

  const empresaId = localStorage.getItem("empresa_id");
  const token = localStorage.getItem("token_project");

  useEffect(() => {
    if (empresaId) {
      fetchProdutos();
      fetchFabricantes();
    }
  }, [empresaId]);

  const fetchProdutos = async () => {
    try {
      const response = await api.get(`/produto/${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProdutos(response.data);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    }
  };

  const fetchFabricantes = async () => {
    try {
      const response = await api.get(`/fabricante/${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFabricantes(response.data);
    } catch (err) {
      console.error("Erro ao buscar fabricantes:", err);
    }
  };

  const fetchProdutoItens = async (produtoId: number) => {
    try {
      const response = await api.get(`/produto_item/${empresaId}/${produtoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProdutoItens(response.data);
    } catch (err) {
      console.error("Erro ao buscar itens do produto:", err);
    }
  };

  const handleCreateProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(
        "/produto",
        {
          nome: nomeProduto,
          precoVenda: parseFloat(precoVenda),
          empresaId: Number(empresaId),
          fabricanteId: Number(fabricanteId),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNomeProduto("");
      setPrecoVenda("");
      setFabricanteId("");
      setIsCreateModalOpen(false);
      fetchProdutos();
    } catch (err) {
      console.error("Erro ao criar produto:", err);
    }
  };

  const handleCreateProdutoItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(
        "/produto_item",
        {
          codigo,
          descricao,
          complemento,
          markup,
          codigogtin,
          produtoId: selectedProduto.id,
          empresaId: Number(empresaId),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCodigo("");
      setDescricao("");
      setComplemento("");
      setMarkup("");
      setCodigogtin("");
      setIsCreateProdutoItemModalOpen(false);
      fetchProdutoItens(selectedProduto.id);
    } catch (err) {
      console.error("Erro ao criar item do produto:", err);
    }
  };

  const openProdutoItensModal = async (produto: any) => {
    setSelectedProduto(produto);
    setIsProdutoItensModalOpen(true);
    await fetchProdutoItens(produto.id);
  };

  const closeProdutoItensModal = () => {
    setSelectedProduto(null);
    setProdutoItens([]);
    setIsProdutoItensModalOpen(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="cursor-pointer mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Novo Produto
      </button>

      <ul className="space-y-4">
        {produtos.map((produto: any) => (
          <li
            key={produto.id}
            className="p-4 bg-white shadow rounded cursor-pointer hover:bg-gray-100"
            onClick={() => openProdutoItensModal(produto)}
          >
            <h2 className="text-lg font-semibold">{produto.nome}</h2>
            <p className="text-gray-600">Estoque: {produto.estoque}</p>
            <p className="text-gray-600">Preço: {produto.precoVenda}</p>
          </li>
        ))}
      </ul>

      {/* Modal Criar Produto */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4">Novo Produto</h2>
            <form onSubmit={handleCreateProduto}>
              <input
                type="text"
                placeholder="Nome do Produto"
                value={nomeProduto}
                onChange={(e) => setNomeProduto(e.target.value)}
                required
                className="mb-3 w-full px-3 py-2 border rounded"
              />
              <input
                type="number"
                placeholder="Preço de Venda"
                value={precoVenda}
                onChange={(e) => setPrecoVenda(e.target.value)}
                required
                className="mb-3 w-full px-3 py-2 border rounded"
              />
              <select
                value={fabricanteId}
                onChange={(e) => setFabricanteId(e.target.value)}
                required
                className="mb-3 w-full px-3 py-2 border rounded"
              >
                <option value="">Selecione um fabricante</option>
                {fabricantes.map((fabricante: any) => (
                  <option key={fabricante.id} value={fabricante.id}>
                    {fabricante.nome}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="cursor-pointer px-4 py-2 bg-gray-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizar Itens + Criar Item */}
      {isProdutoItensModalOpen && selectedProduto && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[800px]">
            <h2 className="text-xl font-bold mb-4">{selectedProduto.nome}</h2>
            <h3 className="text-lg font-semibold mb-2">Itens do Produto:</h3>
            <ul className="grid grid-cols-2 gap-4">
              {produtoItens.length > 0 ? (
                produtoItens.map((item: any) => (
                  <li key={item.id} className="p-4 bg-gray-100 rounded shadow-sm">
                    <p className="font-medium">Código: {item.codigo}</p>
                    <p className="text-sm text-gray-600">Descrição: {item.descricao}</p>
                    <p className="text-sm text-gray-600">Complemento: {item.complemento}</p>
                    <p className="text-sm text-gray-600">GTIN: {item.codigogtin}</p>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">Nenhum item encontrado.</p>
              )}
            </ul>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setIsCreateProdutoItemModalOpen(true)}
                className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Novo Item
              </button>
              <button
                onClick={closeProdutoItensModal}
                className="cursor-pointer px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Produto Item */}
      {isCreateProdutoItemModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4">Novo Item do Produto</h2>
            <form onSubmit={handleCreateProdutoItem}>
              <input
                type="text"
                placeholder="Código"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
                className="mb-3 w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Descrição"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
                className="mb-3 w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Complemento"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                required
                className="mb-3 w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Markup"
                value={markup}
                onChange={(e) => setMarkup(e.target.value)}
                required
                className="mb-3 w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Código GTIN"
                value={codigogtin}
                onChange={(e) => setCodigogtin(e.target.value)}
                required
                className="mb-3 w-full px-3 py-2 border rounded"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateProdutoItemModalOpen(false)}
                  className="cursor-pointer px-4 py-2 bg-gray-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded"
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
