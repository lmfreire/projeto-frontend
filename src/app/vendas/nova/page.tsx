"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";

export default function NovaVendaPage() {
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [clientes, setClientes] = useState<any[]>([]); // Lista de clientes carregados
  const [produtos, setProdutos] = useState<any[]>([]); // Lista de produtos com estoque > 0
  const [descricao, setDescricao] = useState("");
  const [vendaId, setVendaId] = useState<number | null>(null);
  const [itens, setItens] = useState([
    { produtoItemId: "", quantidade: 1, valor_unitario: 0, valor_total: 0, desconto: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  // Carrega o empresaId e usuarioId do localStorage
  useEffect(() => {
    const storedEmpresaId = localStorage.getItem("empresa_id");
    const storedUsuarioId = localStorage.getItem("usuario_id");

    if (storedEmpresaId) setEmpresaId(Number(storedEmpresaId));
    if (storedUsuarioId) setUsuarioId(Number(storedUsuarioId));
  }, []);

  // Carrega a lista de clientes da API
  useEffect(() => {
    const fetchClientes = async () => {
      if (!empresaId) return;

      try {
        const { data } = await api.get(`/cliente/${empresaId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token_project")}` },
        });
        setClientes(data);
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
      }
    };

    fetchClientes();
  }, [empresaId]);

  // Carrega a lista de produtos com estoque > 0
  useEffect(() => {
    const fetchProdutos = async () => {
      if (!empresaId) return;

      try {
        const { data } = await api.get(`/produto/${empresaId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token_project")}` },
        });

        // Filtra produtos com estoque maior que zero
        const produtosComEstoque = data.filter((produto: any) => produto.estoque > 0);
        setProdutos(produtosComEstoque);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      }
    };

    fetchProdutos();
  }, [empresaId]);

  const handleCreateVenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        empresaId,
        usuarioId,
        clienteId,
        valor_total: 0, // Inicialmente 0, será atualizado ao adicionar itens
        descricao,
      };

      const { data } = await api.post("/venda", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token_project")}` },
      });

      setVendaId(data.id); // Salva o ID da venda criada
      alert("Venda criada com sucesso!");
    } catch (err) {
      console.error("Erro ao criar venda:", err);
      alert("Erro ao criar venda. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        vendaId,
        empresaId,
        itens: itens.map((item) => ({
          produtoItemId: item.produtoItemId,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_total: item.valor_total,
          desconto: item.desconto,
        })),
      };

      console.log("Payload para adicionar itens:", payload);

      await api.post("/venda/item", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token_project")}` },
      });

      alert("Itens adicionados com sucesso!");
      setItens([{ produtoItemId: "", quantidade: 1, valor_unitario: 0, valor_total: 0, desconto: 0 }]);
    } catch (err) {
      console.error("Erro ao adicionar itens:", err);
      alert("Erro ao adicionar itens. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItens: any = [...itens];
    updatedItens[index][field] = value;

    // Atualiza o valor total automaticamente
    if (field === "quantidade" || field === "desconto" || field === "produtoItemId") {
      const produtoSelecionado = produtos.find((produto) => produto.id === updatedItens[index].produtoItemId);
      const valorUnitario = produtoSelecionado ? Number(produtoSelecionado.precoVenda) : 0;
      updatedItens[index].valor_unitario = valorUnitario;
      updatedItens[index].valor_total =
        updatedItens[index].quantidade * valorUnitario - updatedItens[index].desconto;
    }

    setItens(updatedItens);
  };

  const handleAddNewItem = () => {
    setItens([...itens, { produtoItemId: "", quantidade: 1, valor_unitario: 0, valor_total: 0, desconto: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Nova Venda</h1>

      {/* Formulário para criar a venda */}
      {!vendaId && (
        <form onSubmit={handleCreateVenda} className="bg-white p-6 rounded shadow w-full max-w-lg mb-6">
          <h2 className="text-lg font-bold mb-4">Criar Venda</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <select
              value={clienteId || ""}
              onChange={(e) => setClienteId(Number(e.target.value))}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
            >
              <option value="" disabled>
                Selecione um cliente
              </option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Venda"}
          </button>
        </form>
      )}

      {/* Formulário para adicionar itens à venda */}
      {vendaId && (
        <form onSubmit={handleAddItem} className="bg-white p-6 rounded shadow w-full max-w-lg">
          <h2 className="text-lg font-bold mb-4">Adicionar Itens</h2>
          {itens.map((item, index) => (
            <div key={index} className="mb-4 border-b pb-4">
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Produto</label>
                <select
                  value={item.produtoItemId}
                  onChange={(e) => handleItemChange(index, "produtoItemId", Number(e.target.value))}
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
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Quantidade</label>
                <input
                  type="number"
                  value={item.quantidade}
                  onChange={(e) => handleItemChange(index, "quantidade", Number(e.target.value))}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Valor Unitário</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.valor_unitario}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm bg-gray-100 focus:outline-none"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Desconto</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.desconto}
                  onChange={(e) => handleItemChange(index, "desconto", Number(e.target.value))}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Valor Total</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.valor_total}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm bg-gray-100 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="text-red-500 hover:underline"
              >
                Remover Item
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddNewItem}
            className="text-blue-500 hover:underline mb-4"
          >
            Adicionar Novo Item
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Adicionando..." : "Adicionar Itens"}
          </button>
        </form>
      )}
    </div>
  );
}