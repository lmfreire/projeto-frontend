'use client';
import { useState } from 'react';
import api from '@/services/api';

type Props = {
  produtoId: number;
  empresaId: number;
  token: string;
  onCreated: () => void;
  onCancel: () => void;
};

export const ProdutoItemForm = ({ produtoId, empresaId, token, onCreated, onCancel }: Props) => {
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [complemento, setComplemento] = useState('');
  const [markup, setMarkup] = useState('');
  const [codigogtin, setCodigogtin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post(
        '/produto_item',
        {
          codigo,
          descricao,
          complemento,
          markup,
          codigogtin,
          produtoId,
          empresaId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCodigo('');
      setDescricao('');
      setComplemento('');
      setMarkup('');
      setCodigogtin('');
      onCreated();
    } catch (error) {
      console.error('Erro ao criar item do produto:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-lg">
      <h2 className="text-lg font-bold mb-4">Novo Item do Produto</h2>

      {[
        { label: 'Código', value: codigo, setValue: setCodigo },
        { label: 'Descrição', value: descricao, setValue: setDescricao },
        { label: 'Complemento', value: complemento, setValue: setComplemento },
        { label: 'Markup', value: markup, setValue: setMarkup },
        { label: 'Código GTIN', value: codigogtin, setValue: setCodigogtin },
      ].map(({ label, value, setValue }) => (
        <div className="mb-4" key={label}>
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
      ))}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
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
  );
};
