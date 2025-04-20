# Sistema de Gestão de Vendas e Produtos

Este é um projeto desenvolvido com [Next.js](https://nextjs.org), criado para facilitar a gestão de vendas, produtos, fabricantes e clientes. O sistema oferece uma interface intuitiva e funcionalidades robustas para otimizar processos e melhorar a eficiência operacional.

## Ideia do Projeto

O objetivo principal do sistema é fornecer uma solução completa para empresas que precisam gerenciar seus produtos, fabricantes, vendas e clientes de forma centralizada. Com este sistema, é possível realizar operações como cadastro, edição, exclusão e consulta de dados, além de acompanhar o desempenho das vendas em tempo real.

## Funcionalidades

### Gestão de Produtos
- Cadastro, edição e exclusão de produtos.
- Controle de estoque e preços.
- Listagem de itens associados a cada produto.

### Gestão de Fabricantes
- Cadastro, edição e exclusão de fabricantes.
- Associação de fabricantes aos produtos.

### Gestão de Vendas
- Criação de novas vendas com descrição e cliente associado.
- Adição e remoção de itens em uma venda.
- Cálculo automático do valor total da venda.
- Exibição de vendas abertas e fechadas, com destaque visual.

### Gestão de Clientes
- Cadastro e listagem de clientes.
- Associação de clientes às vendas.

### Autenticação e Segurança
- Login com validação de token.
- Redirecionamento automático para a página de login em caso de token inválido.

### Relatórios e Informações
- Exibição de informações detalhadas sobre vendas, incluindo cliente e valor total.
- Relatórios detalhados para análise de desempenho.

## Tecnologias Utilizadas

- **Frontend**: [Next.js](https://nextjs.org), [React](https://reactjs.org), [Tailwind CSS](https://tailwindcss.com)
- **Backend**: API RESTful integrada com [Axios](https://axios-http.com)
- **Autenticação**: JWT (JSON Web Token)
- **Gerenciamento de Estado**: Hooks do React (`useState`, `useEffect`)

## Como Executar o Projeto

### Pré-requisitos
- Node.js instalado na máquina.
- Gerenciador de pacotes como `npm`, `yarn`, `pnpm` ou `bun`.

### Passos
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd projeto-frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. Abra [http://localhost:3000](http://localhost:3000) no navegador para acessar o sistema.

## Estrutura do Projeto

- **`src/app`**: Contém as páginas principais do sistema, como login, produtos, fabricantes e vendas.
- **`src/components`**: Componentes reutilizáveis, como o layout do cliente.
- **`src/services`**: Configuração da API para comunicação com o backend.
- **`src/utils`**: Funções utilitárias, como validação de token.

## Próximos Passos

- Implementar relatórios gráficos para análise de vendas.
- Adicionar suporte a múltiplos idiomas.
- Melhorar a experiência do usuário com notificações em tempo real.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.
