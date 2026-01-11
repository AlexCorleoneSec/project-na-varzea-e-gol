# Projeto Na Vázea é Gol - API de Registro de Jogadores

Este projeto é uma API simples desenvolvida na platadorma Lovable. Ela permite registrar jogadores em um banco de dados, garantindo que cada registro seja único através de um identificador (`hash`). A API pode ser utilizada por aplicações web ou mobile para cadastrar e consultar jogadores.

---

# Funcionamento

- A API possui uma rota principal: `/registrar`.
- Os dados dos jogadores são enviados via requisição HTTP POST em formato JSON.
- Os dados são validados e armazenados em um banco de dados SQLite chamado `jogadores.db`.
- O campo `hash` garante que cada jogador seja único.

---

# Estrutura do Banco de Dados

A tabela `jogadores` possui os seguintes campos:


---

# Como executar



---

# **Endpoints**

# `POST /registrar


---

# Detalhes do Código

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

# Principais funções:

- `init_db()`: Cria a tabela `jogadores` se não existir.
- `validar_dados(data)`: Valida os dados recebidos antes de inserir no banco.
- `registrar()`: Rota principal que recebe os dados, valida e insere no banco.

---

# Observações

- O campo `hash` deve ter exatamente 64 caracteres e ser único para cada jogador.
- O campo `numeros` é armazenado como uma string separada por vírgulas.
- O projeto está configurado para rodar em modo de desenvolvimento (`debug=True`).

---

# Licença

Este projeto é livre para uso educacional e pessoal.



__________________________________________________________________________________________
# Teste um projeto milionário

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.


## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
