// README.md - Documentação do projeto
# CuidarJuntos

CuidarJuntos é um sistema de calendário para organizar rodízios de cuidados familiares com pais idosos. O projeto permite que famílias organizem os dias de cuidados entre os filhos, seguindo um sistema de rodízio justo e flexível.

## Funcionalidades

- Cadastro de cuidadores (filhos)
- Geração automática de rodízio seguindo o padrão:
  - Segunda e Terça: Primeiro cuidador
  - Quarta e Quinta: Segundo cuidador
  - Sexta, Sábado e Domingo: Terceiro cuidador
- Visualização de calendário com os cuidadores designados
- Edição manual de dias específicos
- Geração de links de compartilhamento para WhatsApp
- QR Code para fácil acesso ao calendário

## Tecnologias Utilizadas

- Node.js
- Express.js
- EJS (para templates)
- Sequelize ORM
- SQLite (facilmente substituível por MySQL ou PostgreSQL)
- Bootstrap 4
- Font Awesome
- Moment.js (para manipulação de datas)
- QRCode.js

## Requisitos

- Node.js 14.x ou superior
- NPM ou Yarn

## Instalação

1. Clone o repositório:
```
git clone https://github.com/gilsonwindsoft/cuidar-juntos.git
cd cuidar-juntos
```

2. Instale as dependências:
```
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
```
PORT=3000
NODE_ENV=development
SESSION_SECRET=cuidarjuntos_secret
DATABASE_DIALECT=sqlite
DATABASE_STORAGE=./database.sqlite
```

4. Inicie o servidor:
```
npm start
```

5. Acesse a aplicação em seu navegador:
```
http://localhost:3000
```

## Mudando o Banco de Dados

O projeto está configurado para usar SQLite por padrão, mas pode ser facilmente alterado para MySQL ou PostgreSQL:

1. Instale o pacote do banco de dados desejado:
```
# Para MySQL
npm install mysql2

# Para PostgreSQL
npm install pg pg-hstore
```

2. Altere as configurações no arquivo `.env`:
```
# Para MySQL
DATABASE_DIALECT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=cuidarjuntos
DATABASE_USER=root
DATABASE_PASSWORD=sua_senha

# Para PostgreSQL
DATABASE_DIALECT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=cuidarjuntos
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha
```

3. Reinicie o servidor:
```
npm start
```

## Uso

1. Cadastre os cuidadores (filhos) no sistema
2. Gere o calendário de rodízio
3. Visualize o calendário
4. Compartilhe o link via WhatsApp com os demais familiares

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.