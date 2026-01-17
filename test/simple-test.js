#!/usr/bin/env node
/**
 * simple-test.js - Teste simples do FFmpeg no Node.js
 */

const fs = require('fs');
const path = require('path');

// Configura ambiente mínimo do browser
global.window = { location: { href: 'file://' + process.cwd() + '/' } };
global.document = { 
    currentScript: { src: './ffmpeg.js' },
    createElement: () => ({ style: {} })
};

// Função para carregar o ffmpeg.js de forma compatível com Node.js
function loadFFmpegCompat() {
    const code = fs.readFileSync('./ffmpeg.js', 'utf8');
    
    // Patch para carregar o .wasm do filesystem
    const patchedCode = code.replace(
        'var wasmBinaryFile;',
        `var wasmBinaryFile;
        if (typeof window === 'undefined') {
            // Node.js environment
            var fs = require('fs');
            var path = require('path');
            try {
                wasmBinary = fs.readFileSync(path.join(__dirname, 'ffmpeg.wasm'));
            } catch(e) {
                console.error('Cannot load ffmpeg.wasm:', e);
            }
        }`
    );
    
    // Executa o código em um contexto isolado
    const vm = require('vm');
    const context = vm.createContext({
        require,
        module: { exports: {} },
        exports: {},
        console,
        process,
        __dirname: __dirname,
        __filename: __filename,
        global: global,
        window: global.window,
        document: global.document,
        URL: global.URL,
        fetch: require('node-fetch'),
        Blob: require('buffer').Blob,
        FileReader: require('file-reader')
    });
    
    vm.runInContext(patchedCode, context);
    return context.module.exports;
}

async function testBasic() {
    console.log('🧪 Teste básico do FFmpeg no Node.js');
    
    try {
        const createFFmpeg = loadFFmpegCompat();
        const ffmpeg = await createFFmpeg({ log: true });
        
        console.log('✅ FFmpeg carregado!');
        
        // Teste simples
        console.log('\n📋 Testando comando de ajuda:');
        await ffmpeg.run('-h');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        // Fallback: tenta carregar via require normal
        console.log('\n🔄 Tentando método alternativo...');
        try {
            const createFFmpeg = require('./ffmpeg.js');
            const ffmpeg = await createFFmpeg();
            console.log('✅ Carregado via require padrão!');
            await ffmpeg.run('-version');
        } catch (e2) {
            console.error('❌ Método alternativo também falhou:', e2.message);
        }
    }
}

// Teste direto com o arquivo .wasm
async function testDirectWasm() {
    console.log('\n🔧 Teste direto do WASM...');
    
    try {
        // Carrega o WASM manualmente
        const wasmBuffer = fs.readFileSync('./ffmpeg.wasm');
        console.log(`📦 WASM file size: ${wasmBuffer.length} bytes`);
        
        const createFFmpeg = require('./ffmpeg.js');
        const ffmpeg = await createFFmpeg({
            corePath: './ffmpeg.wasm'  // Tenta especificar o caminho
        });
        
        console.log('✅ FFmpeg inicializado!');
        
    } catch (error) {
        console.error('❌ Erro no teste direto:', error.message);
    }
}

// Menu de testes
async function main() {
    const testType = process.argv[2] || 'basic';
    
    switch(testType) {
        case 'basic':
            await testBasic();
            break;
        case 'wasm':
            await testDirectWasm();
            break;
        case 'all':
            await testBasic();
            await testDirectWasm();
            break;
        default:
            console.log('Uso: node simple-test.js [basic|wasm|all]');
    }
}

if (require.main === module) {
    main();
}
