#!/usr/bin/env node
// direct-test.js - Abordagem direta

const fs = require('fs');

// Simula um ambiente browser mínimo
global.window = {
    location: { hostname: '', protocol: 'file:' },
    navigator: { userAgent: 'NodeJS' }
};

global.document = {
    createElement: () => ({ style: {} }),
    currentScript: { src: '' }
};

// Tenta carregar diretamente
async function directLoad() {
    try {
        console.log('🔄 Carregando ffmpeg.js...');
        
        // Método 1: require direto
        const createFFmpeg = require('./ffmpeg.js');
        
        // Método 2: Especificar o caminho do WASM
        const ffmpeg = await createFFmpeg({
            corePath: require('path').resolve('./ffmpeg.wasm'),
            log: true
        });
        
        console.log('✅ Carregado com sucesso!');
        await ffmpeg.run('-version');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

directLoad();
