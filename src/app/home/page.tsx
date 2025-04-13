"use client";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-gray-800">
      <div className="w-full max-w-3xl p-8 bg-gray-100 rounded-lg shadow-lg">
        <h1 className="text-5xl font-bold text-center mb-6">
          Bem-vindo ao Sistema
        </h1>
        <p className="text-lg text-center mb-6">
          Este sistema foi desenvolvido para facilitar a gestão de produtos,
          fabricantes e muito mais. Explore as funcionalidades e otimize sua
          rotina!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Gestão de Produtos</h2>
            <p className="text-sm">
              Organize e gerencie seus produtos de forma eficiente, com controle
              de estoque, preços e muito mais.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Fabricantes</h2>
            <p className="text-sm">
              Mantenha um cadastro atualizado de fabricantes e fornecedores,
              garantindo informações precisas.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Relatórios</h2>
            <p className="text-sm">
              Gere relatórios detalhados para acompanhar o desempenho e tomar
              decisões estratégicas.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Suporte Técnico</h2>
            <p className="text-sm">
              Precisa de ajuda? Nossa equipe de suporte está pronta para
              atender.
            </p>
          </div>
        </div>
        <footer className="mt-8 text-center text-sm text-gray-600">
          © 2025 Sistema de Gestão. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
}