#! node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const socket_io_client_1 = require("socket.io-client");
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Crypt = require("g-crypt");
commander_1.program.version('2.0');
commander_1.program.usage('connect [endereco do servidor] [caminho do arquivo]');
var socket = null;
commander_1.program.command('connect')
    .description('Conecta ao endereco especificado')
    .argument('endereco', 'endereco do servidor')
    .argument('caminho', 'caminho do diretório a ser monitorado')
    .action((endereco, caminho) => {
    let watcher = fs_1.default.watch(caminho);
    watcher.on('change', (change, file) => {
        if (fs_1.default.existsSync(path_1.default.join(caminho, file))) {
            fs_1.default.readFile(path_1.default.join(caminho, file), (err, data) => {
                console.log(fs_1.default.existsSync(path_1.default.join(caminho, file)), path_1.default.join(caminho, file));
                console.log('Arquivo modificado.');
                socket === null || socket === void 0 ? void 0 : socket.emit('data', Crypt.crypter.encrypt({
                    id: os_1.default.hostname(),
                    file: file,
                    data: !(typeof data === 'string') ? data.toString('utf8') : ' '
                }));
            });
        }
    });
    socket = (0, socket_io_client_1.io)(endereco),
        Crypt.passphrase = 'fcf8afd67e96fa3366dd8eafec8bcace',
        Crypt.crypter = Crypt(Crypt.passphrase);
    socket.io.on('error', () => {
        console.log('erro ao se conectar, verifique a rede');
        socket === null || socket === void 0 ? void 0 : socket.close();
        process.exit();
    });
    socket.on('connect', () => {
        console.log(`Conexão estabelecida com sucesso em ${endereco}, esperando modificacoes no diretório...`);
    });
});
commander_1.program.parse(process.argv);
