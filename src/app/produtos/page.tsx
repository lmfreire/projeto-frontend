'use client';
import Link from 'next/link';
import { useProdutoData } from './hooks/useProdutoData';

export default function ProdutosPage() {
  const { produtos } = useProdutoData();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>
      <ul className="space-y-4">
        {produtos.map((produto: any) => (
          <li key={produto.id} className="p-4 bg-white shadow rounded">
            <h2 className="text-lg font-semibold">{produto.nome}</h2>
            <p className="text-gray-600">Estoque: {produto.estoque}</p>
            <p className="text-gray-600">Preço: {produto.precoVenda}</p>
            <Link
              href={`/produtos/${produto.id}`}
              className="cursor-pointer mt-2 inline-block text-blue-600 hover:underline"
            >
              Ver itens
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
