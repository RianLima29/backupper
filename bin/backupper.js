"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const screenshot_desktop_1 = __importDefault(require("screenshot-desktop"));
const ss = require('socket.io-stream');
const Crypt = require("g-crypt");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
var socket = null;
let endereco = process.env.ENDERECO || '';
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let currentDay = new Date().getDate();
switch (currentMonth) {
    case 1:
        currentMonth = 'Janeiro';
        break;
    case 2:
        currentMonth = 'Fevereiro';
        break;
    case 3:
        currentMonth = 'Março';
        break;
    case 4:
        currentMonth = 'Abril';
        break;
    case 5:
        currentMonth = 'Maio';
        break;
    case 6:
        currentMonth = 'Junho';
        break;
    case 7:
        currentMonth = 'Julho';
        break;
    case 8:
        currentMonth = 'Agosto';
        break;
    case 9:
        currentMonth = 'Setembro';
        break;
    case 10:
        currentMonth = 'Outubro';
        break;
    case 11:
        currentMonth = 'Novembro';
        break;
    case 12:
        currentMonth = 'Dezembro';
        break;
}
let caminho = path_1.default.join(`${process.env.CAMINHO}\\${currentYear}\\${currentMonth}`);
socket = (0, socket_io_client_1.io)(endereco),
    Crypt.passphrase = process.env.PASSPHRASE,
    Crypt.crypter = Crypt(Crypt.passphrase);
socket.on('connect', () => {
    socket === null || socket === void 0 ? void 0 : socket.emit('needTodaysFile?', Crypt.crypter.encrypt({
        id: os_1.default.hostname(),
        file: `gcecho${currentDay < 10 ? 0 : ''}${currentDay}.log`
    }));
});
socket.on('sendTodaysFile', () => {
    var _a;
    console.log(`gcecho${currentDay < 10 ? 0 : ''}${currentDay}.log`);
    let stream = ss.createStream();
    fs_1.default.createReadStream(path_1.default.join(caminho, `gcecho${currentDay < 10 ? 0 : ''}${currentDay}.log`)).pipe(stream);
    (_a = ss(socket)) === null || _a === void 0 ? void 0 : _a.emit('todaysFile', stream, Crypt.crypter.encrypt({
        id: os_1.default.hostname(),
        file: `gcecho${currentDay < 10 ? 0 : ''}${currentDay}.log`,
    }));
    stream.on('end', () => {
        console.log('enviado');
    });
    socket === null || socket === void 0 ? void 0 : socket.on('suc', () => {
        fs_1.default.readFile(path_1.default.join(caminho, `gcecho${currentDay < 10 ? 0 : ''}${currentDay}.log`), (err, data) => {
            lastFile.data = data.toString('utf8');
            lastFile.length = data.toString('utf8').length;
            lastFile.name = `gcecho${currentDay < 10 ? 0 : ''}${currentDay}.log`;
            console.log('consegui');
        });
    });
});
socket.on('disconnect', (err) => {
    console.log(err);
});
if (fs_1.default.existsSync(caminho)) {
    var watcher = fs_1.default.watch(caminho);
}
else {
    var watcher = fs_1.default.watch('./');
}
let lastFile = { length: 0, name: '', data: '' };
console.log(caminho);
watcher.on('change', (change, file) => {
    console.log(lastFile);
    if (fs_1.default.existsSync(path_1.default.join(caminho, file))) {
        fs_1.default.readFile(path_1.default.join(caminho, file), (err, data) => {
            if (err) {
                throw err;
            }
            if (data.toString('utf8').length < lastFile.length && file == lastFile.name) {
                (0, screenshot_desktop_1.default)({ format: 'png' }).then((buffer) => {
                    console.log('Emitido');
                    socket === null || socket === void 0 ? void 0 : socket.emit('printscreen', buffer);
                });
                console.log('fraude');
                socket === null || socket === void 0 ? void 0 : socket.emit('fraud', Crypt.crypter.encrypt({
                    id: os_1.default.hostname(),
                    file: file,
                    data: (data === null || data === void 0 ? void 0 : data.toString('utf8').slice(lastFile.length, data === null || data === void 0 ? void 0 : data.toString('utf8').length)) || ''
                }));
            }
            socket === null || socket === void 0 ? void 0 : socket.emit('data', Crypt.crypter.encrypt({
                id: os_1.default.hostname(),
                file: file,
                data: (data === null || data === void 0 ? void 0 : data.toString('utf8').slice(lastFile.length, data === null || data === void 0 ? void 0 : data.toString('utf8').length)) || ''
            }));
            lastFile.data = data.toString('utf8');
            lastFile.length = data.toString('utf8').length;
            lastFile.name = file;
        });
    }
});
