#!/usr/bin/env node
/**
 * quick-test.js - Teste rápido do ffmpeg.js
 */

const fs = require('fs');
const path = require('path');

// Carrega o ffmpeg.js
const createFFmpeg = require('./ffmpeg.js');

async function quickTest() {
    console.log('🧪 Iniciando teste rápido do ffmpeg.js...');
    
    try {
        // Inicializa o FFmpeg
        const ffmpeg = await createFFmpeg({
            log: true,
            progress: (p) => {
                console.log(`Progresso: ${(p.ratio * 100).toFixed(1)}%`);
            }
        });
        
        console.log('✅ FFmpeg.js carregado!');
        
        // Teste simples: versão
        console.log('\n📋 Testando comando de versão:');
        await ffmpeg.run('-version');
        
        // Teste: listar codecs
        console.log('\n🔊 Testando listagem de codecs:');
        await ffmpeg.run('-codecs');
        
        console.log('\n🎉 Todos os testes passaram!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Teste com arquivo real
async function testWithFile() {
    console.log('\n🎵 Testando com arquivo de áudio...');
    
    try {
        const ffmpeg = await createFFmpeg({ log: true });
        
        // Cria um arquivo WAV simples de teste
        const testWav = createSimpleWav();
        ffmpeg.FS.writeFile('test.wav', testWav);
        
        console.log('Arquivo de teste criado');
        
        // Converte para MP3
        await ffmpeg.run('-i', 'test.wav', '-c:a', 'libmp3lame', 'test.mp3');
        
        // Lê o resultado
        const mp3Data = ffmpeg.FS.readFile('test.mp3');
        console.log(`✅ Arquivo MP3 criado: ${mp3Data.length} bytes`);
        
        // Salva no disco
        fs.writeFileSync('output.mp3', Buffer.from(mp3Data));
        console.log('💾 MP3 salvo como output.mp3');
        
    } catch (error) {
        console.error('❌ Erro no teste com arquivo:', error);
    }
}

// Função auxiliar para criar um WAV simples
function createSimpleWav() {
    // Cabeçalho WAV básico + alguns segundos de silêncio
    const header = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, // "RIFF"
        0x24, 0x08, 0x00, 0x00, // Tamanho do arquivo
        0x57, 0x41, 0x56, 0x45, // "WAVE"
        0x66, 0x6d, 0x74, 0x20, // "fmt "
        0x10, 0x00, 0x00, 0x00, // Tamanho do chunk fmt
        0x01, 0x00,             // Formato de áudio (PCM)
        0x01, 0x00,             // Número de canais (1 = mono)
        0x44, 0xac, 0x00, 0x00, // Sample rate (44100 Hz)
        0x88, 0x58, 0x01, 0x00, // Byte rate
        0x02, 0x00,             // Block align
        0x10, 0x00,             // Bits per sample (16)
        0x64, 0x61, 0x74, 0x61, // "data"
        0x00, 0x08, 0x00, 0x00  // Tamanho dos dados
    ]);
    
    // Dados de áudio (silêncio)
    const silence = new Uint8Array(2048); // 1KB de silêncio
    
    const wavFile = new Uint8Array(header.length + silence.length);
    wavFile.set(header);
    wavFile.set(silence, header.length);
    
    return wavFile;
}

// Menu de testes
async function runTests() {
    console.log('🧪 Menu de Testes FFmpeg.js\n');
    console.log('1. Teste básico (versão e codecs)');
    console.log('2. Teste com arquivo de áudio');
    console.log('3. Teste completo');
    console.log('4. Usar como CLI normal');
    
    const option = process.argv[2] || '1';
    
    switch(option) {
        case '1':
            await quickTest();
            break;
        case '2':
            await testWithFile();
            break;
        case '3':
            await quickTest();
            await testWithFile();
            break;
        case '4':
            // Usa o CLI completo
            const createFFmpeg = require('./ffmpeg.js');
            const ffmpeg = await createFFmpeg({ log: true });
            const args = process.argv.slice(3);
            await ffmpeg.run(...args);
            break;
        default:
            console.log('❌ Opção inválida');
    }
}

if (require.main === module) {
    runTests();
}
