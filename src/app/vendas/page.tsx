"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api";
import { validateTokenAndRedirect } from "../../utils/auth";
import jsPDF from 'jspdf';

export default function VendaPage() {
  const [vendas, setVendas] = useState([]);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [clientes, setClientes] = useState<any[]>([]); // Lista de clientes carregados
  const [isModalOpen, setIsModalOpen] = useState(false); // Controle do modal
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    const empresaIdLocal = Number(localStorage.getItem("empresa_id"));
    setEmpresaId(empresaIdLocal);

    if (empresaIdLocal) {
      fetchVendas(empresaIdLocal);
      fetchClientes(empresaIdLocal);
    }
  }, []);

  const fetchVendas = async (empresaId: number) => {
    try {
      const { data } = await api.get(`/venda/${empresaId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token_project")}` },
      });

      // Ordena as vendas: abertas primeiro, fechadas depois
      const vendasOrdenadas = data.sort((a: any, b: any) => {
        if (a.finalizada === b.finalizada) return 0;
        return a.finalizada ? 1 : -1; // Vendas abertas (false) vêm antes de fechadas (true)
      });

      setVendas(vendasOrdenadas);
    } catch (err) {
      console.error("Erro ao buscar vendas:", err);
    }
  };

  const fetchClientes = async (empresaId: number) => {
    try {
      const { data } = await api.get(`/cliente/${empresaId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token_project")}` },
      });
      setClientes(data);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    }
  };

  const handleVendaClick = (venda: any) => {
    localStorage.setItem("VendaItem", JSON.stringify(venda)); // Salva o VendaItem no localStorage
    router.push(`/vendas/${venda.id}`); // Redireciona para a página de detalhes da venda
  };

  const handleNovaVenda = () => {
    setIsModalOpen(true); // Abre o modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Fecha o modal
    setClienteId(null);
    setDescricao("");
  };

  const handleSubmitNovaVenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        empresaId,
        clienteId,
        valor_total: 0, // Sempre 0
        descricao,
      };

      await api.post("/venda", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token_project")}` },
      });

      alert("Venda criada com sucesso!");
      handleCloseModal(); // Fecha o modal após criar a venda
      fetchVendas(empresaId!); // Atualiza a lista de vendas
    } catch (err) {
      console.error("Erro ao criar venda:", err);
      alert("Erro ao criar venda. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };


  const handleImprimirRecibo = async (vendaId: number) => {
    const empresaId = localStorage.getItem('empresa_id');
    const token = localStorage.getItem('token_project');

    if (!empresaId || !vendaId) {
      alert('Erro: Dados ausentes para gerar o recibo.');
      return;
    }

    try {
      const { data } = await api.get(`/venda/${empresaId}/${vendaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const doc = new jsPDF();
      let y = 10;

      // Cabeçalho
      doc.setFontSize(18);
      doc.text(`PEDIDO N. ${data.id}`, 105, y, { align: 'center' });
      y += 10;
      doc.setFontSize(14);
      doc.text(data.empresa.nome, 105, y, { align: 'center' });
      y += 7;
      doc.setFontSize(10);
      doc.text(`Telefone: ${data.empresa.telefone || '(11) 3921-3568'} - E-mail: ${data.empresa.email || 'contatobateriasradial@gmail.com'}`, 105, y, { align: 'center' });
      y += 10;

      const formatDateToBrasilia = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(date);
      };

      const formatTimeToBrasilia = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).format(date);
      };


      const dataVendaFormatada = formatDateToBrasilia(data.data_venda);
      const horaVendaFormatada = formatTimeToBrasilia(data.data_venda);

      // Informações da venda
      doc.setFontSize(10);
      const dataVenda = new Date(data.data_venda);
      doc.text(`DOCUMENTO NÃO FISCAL    ${dataVendaFormatada} ${horaVendaFormatada}    Página: 1`, 10, y);
      y += 10;

      doc.line(10, y, 200, y); // Linha separadora
      y += 5;

      // Cliente
      doc.text(`Cliente....: ${data.cliente.nome}`, 10, y);
      doc.text(`Código..: ${data.cliente.id}`, 150, y);
      y += 5;
      doc.text(`Telefone: ${data.cliente.telefone || ''}`, 10, y);
      y += 5;
      doc.text(`Logradouro.: ${data.cliente.endereco || ''}`, 10, y);
      y += 5;
      doc.text(`CPF/CNPJ: ${data.cliente.cpf || ''}`, 10, y);
      y += 5;
      doc.text(`Vendedor...: ${data.empresa.nome}`, 10, y);
      doc.text(`Emissão.: ${dataVenda.toLocaleDateString()}`, 150, y);
      y += 5;
      if (data.descricao) {
        doc.text(`Observações: ${data.descricao}`, 10, y);
        y += 5;
      }

      doc.line(10, y, 200, y); // Linha separadora
      y += 5;

      // Cabeçalho da Tabela de Itens
      doc.setFont('Helvetica', 'bold');
      doc.text('Código', 10, y);
      doc.text('Descrição', 40, y);
      doc.text('Unidade', 100, y);
      doc.text('Quantidade', 120, y);
      doc.text('Preço', 150, y);
      doc.text('Total', 190, y, { align: 'right' });
      doc.setFont('Helvetica', 'normal');
      y += 5;
      doc.line(10, y, 200, y);
      y += 5;

      // Itens
      let subtotal = 0;
      data.VendaItem.forEach((item: any) => {
        if (y > 270) { // Nova página se passar do limite
          doc.addPage();
          y = 10;
        }
        doc.text(item.produtoItem.codigo || '', 10, y);
        doc.text(item.produtoItem.produto.nome, 40, y);
        doc.text('UN', 100, y);
        doc.text(`${item.quantidade}`, 125, y);
        doc.text(`R$ ${Number(item.valor_unitario).toFixed(2)}`, 150, y);
        doc.text(`R$ ${Number(item.valor_total).toFixed(2)}`, 200, y, { align: 'right' });

        subtotal += Number(item.valor_total);
        y += 6;
      });

      doc.line(10, y, 200, y);
      y += 5;

      // Resumo
      doc.text(`Itens: ${data.VendaItem.length}`, 10, y);
      doc.text(`Subtotal: R$ ${subtotal.toFixed(2)}`, 100, y);
      doc.text(`Desconto: R$ 0,00`, 150, y);
      y += 5;
      doc.text(`Total: R$ ${subtotal.toFixed(2)}`, 10, y);

      y += 10;

      // Forma de pagamento
      doc.line(10, y, 200, y);
      y += 5;
      doc.setFont('Helvetica', 'bold');
      doc.text('Forma de pagamento', 10, y);
      doc.setFont('Helvetica', 'normal');
      y += 5;
      doc.text('Dinheiro', 10, y);
      doc.text(`R$ ${subtotal.toFixed(2)}`, 150, y);

      y += 10;
      doc.line(10, y, 200, y);
      y += 10;

      // Rodapé
      doc.setFontSize(10);
      doc.text('EXIJA CUPOM FISCAL OU NOTA FISCAL', 105, y, { align: 'center' });

      // Salvar PDF
      doc.save(`Pedido_Venda_${vendaId}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar recibo:', err);
      alert('Erro ao gerar recibo. Tente novamente.');
    }
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
                className={`p-4 rounded shadow cursor-pointer hover:bg-gray-100 ${venda.finalizada ? "bg-gray-200" : "bg-green-100"
                  }`}
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
                <p
                  className={`text-sm font-bold ${venda.finalizada ? "text-red-600" : "text-green-600"
                    }`}
                >
                  {venda.finalizada ? "Fechada" : "Aberta"}
                </p>

                {venda.finalizada && (
                  <button
                    onClick={() => handleImprimirRecibo(venda.id)}
                    className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
                  >
                    Imprimir Recibo
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhuma venda encontrada.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nova Venda</h2>
            <form onSubmit={handleSubmitNovaVenda}>
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
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cursor-pointer bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}