'use client';
import { useEffect, useState } from "react";
import api from "../../services/api";
import { validateTokenAndRedirect } from "../../utils/auth";
import { useRouter } from "next/navigation";

export default function FabricantesPage() {
  const [fabricantes, setFabricantes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomeFabricante, setNomeFabricante] = useState("");
  const empresaId = localStorage.getItem("empresa_id");
  const token = localStorage.getItem("token_project");
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
    if (empresaId) {
      fetchFabricantes();
    }
  }, [empresaId]);

  const fetchFabricantes = async () => {
    try {
      const response = await api.get(`/fabricante/${empresaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const fabricantesData = response.data.map((fabricante: any) => ({
        id: fabricante.id,
        nome: fabricante.nome,
        empresaId: fabricante.empresaId,
      }));
      setFabricantes(fabricantesData);
    } catch (err) {
      console.error("Erro ao buscar fabricantes:", err);
    }
  };

  const handleCreateFabricante = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(
        "/fabricante",
        { nome: nomeFabricante, empresaId: Number(empresaId) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNomeFabricante(""); // Limpa o campo do formulário
      setIsModalOpen(false); // Fecha o modal
      fetchFabricantes(); // Atualiza a lista de fabricantes
    } catch (err) {
      console.error("Erro ao criar fabricante:", err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Fabricantes</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Novo Fabricante
      </button>
      <div className="max-h-[65vh] overflow-y-auto pr-2">
        <ul className="space-y-4">
          {fabricantes.length > 0 ? (
            fabricantes.map((fabricante: any) => (
              <li
                key={fabricante.id}
                className="p-4 bg-white shadow rounded"
              >
                <h2 className="text-lg font-semibold">{fabricante.nome}</h2>
              </li>
            ))
          ) : (
            <p className="text-gray-500">Nenhum fabricante encontrado.</p>
          )}
        </ul>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4">Novo Fabricante</h2>
            <form onSubmit={handleCreateFabricante}>
              <div className="mb-4">
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nome do Fabricante
                </label>
                <input
                  type="text"
                  id="nome"
                  value={nomeFabricante}
                  onChange={(e) => setNomeFabricante(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
          </div>
        </div>
      )}
    </div>
  );
}