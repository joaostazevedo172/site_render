const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();

// Middleware para servir arquivos estáticos do diretório atual
app.use(express.static(path.join(__dirname)));

// Middleware para processar corpo das requisições
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do banco de dados
const con = mysql.createConnection({
    host: "sql10.freemysqlhosting.net",
    user: "sql10725595",
    password: "bWvpTgI5NR",
    database: "sql10725595"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Conectado ao MySQL!");
});

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage(); // Armazenamento em memória

const upload = multer({ storage: storage });

// Rotas para servir os arquivos HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'menu.html'));
});

app.get('/formulario', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});

app.get('/delete', (req, res) => {
    res.sendFile(path.join(__dirname, 'delete.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'search.html'));
});

app.get('/consulta', (req, res) => {
    res.sendFile(path.join(__dirname, 'consulta.html'));
});

app.get('/update', (req, res) => {
    res.sendFile(path.join(__dirname, 'update.html'));
});

app.get('/listar', (req, res) => {
    res.sendFile(path.join(__dirname, 'listar.html'));
});

// API para obter usuários
app.get('/usuarios', (req, res) => {
    const sql = "SELECT * FROM usuario";
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
});

// API para submeter um novo usuário
app.post('/submit', upload.single('image'), (req, res) => {
    const { name, password, phone } = req.body;
    // Sem tratamento de imagem devido ao uso de storage em memória

    const sql = "INSERT INTO usuario (nome, senha, telefone) VALUES (?, ?, ?)";
    con.query(sql, [name, password, phone], function (err, result) {
        if (err) {
            console.error("Erro ao inserir no banco de dados:", err);
            res.status(500).send("Erro ao salvar os dados. Por favor, tente novamente.");
            return;
        }
        console.log("1 registro inserido");
        res.send("Cadastro realizado com sucesso!");
    });
});

// API para deletar um usuário
app.post('/delete', (req, res) => {
    const { id } = req.body;
    const sql = "DELETE FROM usuario WHERE id = ?";
    con.query(sql, [id], function (err, result) {
        if (err) {
            console.error("Erro ao excluir do banco de dados:", err);
            res.status(500).send("Erro ao excluir o usuário. Por favor, tente novamente.");
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send("Usuário não encontrado.");
            return;
        }
        res.send("Usuário excluído com sucesso!");
    });
});

// API para buscar usuários com base em uma consulta
app.get('/search-results', (req, res) => {
    const { query } = req.query;

    let sql = "SELECT id, nome, telefone, senha FROM usuario";
    const params = [];

    if (query !== '*') {
        sql += " WHERE nome LIKE ? OR telefone LIKE ? OR senha LIKE ? OR id = ?";
        const likeQuery = '%' + query + '%';
        params.push(likeQuery, likeQuery, likeQuery, query);
    }

    con.query(sql, params, function (err, result) {
        if (err) {
            console.error("Erro ao buscar no banco de dados:", err);
            res.status(500).send("Erro ao buscar os dados. Por favor, tente novamente.");
            return;
        }
        res.json(result);
    });
});

// API para atualizar um usuário
app.post('/update', upload.single('image'), (req, res) => {
    const { id, name, password, phone } = req.body;
    // Sem tratamento de imagem devido ao uso de storage em memória

    let sql = "UPDATE usuario SET ";
    const params = [];

    if (name) {
        sql += "nome = ?, ";
        params.push(name);
    }
    if (password) {
        sql += "senha = ?, ";
        params.push(password);
    }
    if (phone) {
        sql += "telefone = ?, ";
        params.push(phone);
    }

    sql = sql.slice(0, -2);
    sql += " WHERE id = ?";
    params.push(id);

    con.query(sql, params, function (err, result) {
        if (err) {
            console.error("Erro ao atualizar o banco de dados:", err);
            res.status(500).send("Erro ao atualizar os dados. Por favor, tente novamente.");
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send("Usuário não encontrado.");
            return;
        }
        res.send("Usuário atualizado com sucesso!");
    });
});

// Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
