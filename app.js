require('dotenv').config();
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');
const { sequelize } = require('./src/config/database');
const ShareLink = require('./src/models/ShareLink');

// Importação das rotas
const caregiversRoutes = require('./src/routes/caregiversRoutes');
const schedulesRoutes = require('./src/routes/schedulesRoutes');
const sharingRoutes = require('./src/routes/sharingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Torne o moment disponível para todas as views
app.locals.moment = require('moment');
moment = require('moment');
moment.locale('pt-br'); // Configure o locale para português do Brasil

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Rotas
app.get('/', (req, res) => {
  res.render('index');
});

app.use('/cuidadores', caregiversRoutes);
app.use('/calendario', schedulesRoutes);
app.use('/compartilhar', sharingRoutes);

// Inicialização do banco de dados e servidor
sequelize.sync()
  .then(() => {
    console.log('Banco de dados sincronizado');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erro ao sincronizar banco de dados:', err);
  });

