'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';

export default function VendaDetalhadaPage() {
    const { id } = useParams();
    const router = useRouter();
    const [vendaDetalhada, setVendaDetalhada] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

                console.log(data);

                setVendaDetalhada(data);
            } catch (err) {
                console.error('Erro ao buscar venda:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVenda();
    }, [id]);

    return (
        <div className="p-8">
            <button onClick={() => router.back()} className="cursor-pointer text-sm text-gray-600 mb-4 hover:underline">
                ← Voltar para produtos
            </button>

            <h1 className="text-2xl font-bold mb-6">Detalhes da Venda</h1>

            {loading ? (
                <p>Carregando...</p>
            ) : vendaDetalhada ? (
                <ul>
                    {
                        vendaDetalhada.VendaItem.map((item: any) => (
                            <li key={item.id} className="p-6 bg-white rounded shadow mb-4">
                                <p><strong>Produto:</strong> {item.produtoItem.produto.nome}</p>
                                <p><strong>Quantidade:</strong> {item.quantidade}</p>
                                <p><strong>Valor Unitário:</strong> R$ {Number(item.valor_unitario || 0).toFixed(2)}</p>
                                <p><strong>Valor Total:</strong> R$ {Number(item.valor_total || 0).toFixed(2)}</p>
                            </li>

                        ))
                    }
                </ul>
            ) : (
                <p>Venda não encontrada.</p>
            )}
        </div>
    );
}