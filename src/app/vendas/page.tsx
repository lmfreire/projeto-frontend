"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api";

export default function VendaPage() {
  const [vendas, setVendas] = useState([]);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const empresaIdLocal = Number(localStorage.getItem("empresa_id"));
    setEmpresaId(empresaIdLocal);

    if (empresaIdLocal) {
      fetchVendas(empresaIdLocal);
    }
  }, []);

  const fetchVendas = async (empresaId: number) => {
    try {
      const { data } = await api.get(`/venda/${empresaId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token_project")}` },
      });
      setVendas(data);
    } catch (err) {
      console.error("Erro ao buscar vendas:", err);
    }
  };

  const handleVendaClick = (venda: any) => {
    localStorage.setItem("VendaItem", JSON.stringify(venda)); // Salva o VendaItem no localStorage
    router.push(`/vendas/${venda.id}`); // Redireciona para a página de detalhes da venda
  };

  const handleNovaVenda = () => {
    router.push("/vendas/nova");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Listagem de Vendas</h1>
        <button
          onClick={handleNovaVenda}
          className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Nova Venda
        </button>
      </div>

      <div className="max-h-[65vh] overflow-y-auto border border-gray-300 rounded p-4">
        {vendas.length > 0 ? (
          <ul className="space-y-4">
            {vendas.map((venda: any) => (
              <li
                key={venda.id}
                className="p-4 bg-white shadow rounded cursor-pointer hover:bg-gray-100"
                onClick={() => handleVendaClick(venda)}
              >
                <h2 className="text-lg font-semibold">{venda.descricao}</h2>
                <p className="text-gray-600">
                  <strong>Cliente:</strong> {venda.cliente.nome}
                </p>
                <p className="text-gray-600">
                  <strong>Data da Venda:</strong> {new Date(venda.data_venda).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  <strong>Valor Total:</strong> R$ {Number(venda.valor_total).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhuma venda encontrada.</p>
        )}
      </div>
    </div>
  );
}