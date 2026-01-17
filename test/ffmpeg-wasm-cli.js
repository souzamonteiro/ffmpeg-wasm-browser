#!/usr/bin/env node
/**
 * ffmpeg-node-cli.js - FFmpeg.js adaptado para Node.js
 */

const fs = require('fs');
const path = require('path');

// Patch para simular ambiente browser no Node.js
global.window = {
    location: { href: 'file://' + process.cwd() + '/' },
    navigator: { userAgent: 'Node.js' }
};

global.document = {
    createElement: () => ({ 
        style: {},
        setAttribute: () => {},
        appendChild: () => {} 
    }),
    createElementNS: () => ({ 
        setAttribute: () => {} 
    }),
    head: { appendChild: () => {} },
    currentScript: { src: './ffmpeg.js' }
};

global.URL = {
    createObjectURL: () => 'blob:nodejs',
    revokeObjectURL: () => {}
};

global.fetch = require('node-fetch');
global.FileReader = require('file-reader');
global.Blob = global.Blob || require('buffer').Blob;
global.crypto = require('crypto');

// Carrega o ffmpeg.js com patches
function loadFFmpeg() {
    // Lê o arquivo ffmpeg.js como string
    const ffmpegCode = fs.readFileSync(path.join(__dirname, 'ffmpeg.js'), 'utf8');
    
    // Injeta um patch para carregar o .wasm do filesystem
    const patchedCode = ffmpegCode.replace(
        'async function instantiateAsync(binary,binaryFile,imports){',
        `async function instantiateAsync(binary,binaryFile,imports){
            if (typeof binaryFile === 'string' && !binaryFile.startsWith('http')) {
                // Carrega do filesystem no Node.js
                try {
                    const wasmPath = path.join(__dirname, binaryFile);
                    const wasmBuffer = fs.readFileSync(wasmPath);
                    binary = new Uint8Array(wasmBuffer);
                    binaryFile = undefined;
                } catch(e) {
                    console.error('Failed to load WASM file:', e);
                    throw e;
                }
            }
        `
    );
    
    // Executa o código patched
    const vm = require('vm');
    const context = {
        require,
        module: { exports: {} },
        exports: {},
        console,
        process,
        __dirname,
        path,
        fs,
        ...global
    };
    
    vm.createContext(context);
    vm.runInContext(patchedCode, context);
    
    return context.module.exports;
}

// Implementação principal
class NodeFFmpeg {
    constructor() {
        this.ffmpeg = null;
        this.filesystem = new Map();
    }

    async initialize() {
        if (this.ffmpeg) return;
        
        console.log('🔄 Carregando FFmpeg WebAssembly...');
        
        try {
            const createFFmpeg = loadFFmpeg();
            this.ffmpeg = await createFFmpeg({
                log: true,
                progress: (p) => {
                    const percent = (p.ratio * 100).toFixed(1);
                    process.stdout.write(`\rProgresso: ${percent}%`);
                }
            });
            
            console.log('\n✅ FFmpeg carregado com sucesso!');
        } catch (error) {
            console.error('\n❌ Erro ao carregar FFmpeg:', error);
            throw error;
        }
    }

    async run(...args) {
        await this.initialize();
        
        // Prepara arquivos de entrada
        await this.prepareInputFiles(args);
        
        console.log(`\n🎬 Executando: ffmpeg ${args.join(' ')}`);
        
        try {
            await this.ffmpeg.run(...args);
            
            // Salva arquivos de saída
            await this.saveOutputFiles(args);
            
            console.log('\n✅ Comando executado com sucesso!');
            return 0;
        } catch (error) {
            console.error('\n❌ Erro durante execução:', error);
            return 1;
        }
    }

    async prepareInputFiles(args) {
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-i' && i + 1 < args.length) {
                const filename = args[i + 1];
                
                if (fs.existsSync(filename)) {
                    console.log(`📥 Carregando arquivo: ${filename}`);
                    const data = fs.readFileSync(filename);
                    this.ffmpeg.FS.writeFile(filename, new Uint8Array(data));
                } else {
                    console.log(`⚠️ Arquivo não encontrado: ${filename}`);
                }
            }
        }
    }

    async saveOutputFiles(args) {
        // Encontra arquivos de saída
        const outputFiles = [];
        
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            
            // Ignora opções e flags
            if (arg.startsWith('-')) {
                if (arg === '-i') i++; // Pula o próximo argumento (arquivo de entrada)
                continue;
            }
            
            // Primeiro argumento não-opção após -i é entrada, os outros são saídas
            if (i > 0 && args[i - 1] !== '-i') {
                outputFiles.push(arg);
            }
        }
        
        // Salva os arquivos
        for (const filename of outputFiles) {
            try {
                const data = this.ffmpeg.FS.readFile(filename);
                fs.writeFileSync(filename, Buffer.from(data));
                console.log(`💾 Salvo: ${filename} (${data.length} bytes)`);
            } catch (error) {
                console.log(`⚠️ Não foi possível salvar ${filename}: ${error.message}`);
            }
        }
    }
}

// Interface de linha de comando
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
        showHelp();
        return;
    }
    
    if (args.includes('-version') || args.includes('--version')) {
        console.log('FFmpeg.js Node.js CLI v1.0.0');
        return;
    }
    
    const ffmpeg = new NodeFFmpeg();
    
    try {
        const exitCode = await ffmpeg.run(...args);
        process.exit(exitCode);
    } catch (error) {
        console.error('💥 Erro fatal:', error);
        process.exit(1);
    }
}

function showHelp() {
    console.log(`
FFmpeg.js Node.js CLI
Usage: node ffmpeg-node-cli.js [ffmpeg options]

Exemplos:
  node ffmpeg-node-cli.js -version
  node ffmpeg-node-cli.js -i input.wav output.mp3
  node ffmpeg-node-cli.js -codecs

Certifique-se de que ffmpeg.js e ffmpeg.wasm estão no mesmo diretório.
    `);
}

if (require.main === module) {
    main();
}

module.exports = NodeFFmpeg;
