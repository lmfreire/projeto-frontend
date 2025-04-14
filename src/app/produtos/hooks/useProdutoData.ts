'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';

export const useProdutoData = () => {
  const [produtos, setProdutos] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);
  const [produtoItens, setProdutoItens] = useState([]);
  const [selectedProduto, setSelectedProduto] = useState<any>(null);

  const empresaId = typeof window !== 'undefined' ? localStorage.getItem('empresa_id') : null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token_project') : null;

  useEffect(() => {
    if (empresaId && token) {
      fetchProdutos();
      fetchFabricantes();
    }
  }, [empresaId]);

  const fetchProdutos = async () => {
    try {
      const { data } = await api.get(`/produto/${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProdutos(data);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    }
  };

  const fetchFabricantes = async () => {
    try {
      const { data } = await api.get(`/fabricante/${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFabricantes(data);
    } catch (err) {
      console.error('Erro ao buscar fabricantes:', err);
    }
  };

  const fetchProdutoItens = async (produtoId: number) => {
    try {
      const { data } = await api.get(`/produto_item/${empresaId}/${produtoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProdutoItens(data);
    } catch (err) {
      console.error('Erro ao buscar itens do produto:', err);
    }
  };

  return {
    produtos,
    fabricantes,
    produtoItens,
    selectedProduto,
    setSelectedProduto,
    fetchProdutos,
    fetchFabricantes,
    fetchProdutoItens,
  };
};
