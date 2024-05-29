require('dotenv').config({path:require('find-config')('.env')})
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const {ethers} = require('ethers')
const contract = require('../artifacts/contracts/Boletos.sol/Boletos.json');
const jugadorContractArtifact = require('../artifacts/contracts/Jugador.sol/Jugadores.json');
const loteriaContractArtifact = require('../artifacts/contracts/Loteria.sol/Loterias.json');
const { format } = require('path')
const {
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    API_URL,
    PRIVATE_KEY,
    PUBLIC_KEY,
    BOLETOS_CONTRACT,
    JUGADOR_CONTRACT,
    LOTERIA_CONTRACT
} = process.env

async function createTransaction(provider,method,params) {
    const etherInterface = new ethers.utils.Interface(contract.abi);
    const nonce = await provider.getTransactionCount(PUBLIC_KEY,'latest')
    const gasPrice = await provider.getGasPrice();
    const network = await provider.getNetwork();
    const {chainId} = network;
    const transaction = {
        from : PUBLIC_KEY,
        to : BOLETOS_CONTRACT,
        nonce,
        chainId,
        gasPrice,
        data: etherInterface.encodeFunctionData(method,params)
    }
    return transaction
}

async function createTransactionJugador(provider,method,params) {
    const etherInterface = new ethers.utils.Interface(jugadorContractArtifact.abi);
    const nonce = await provider.getTransactionCount(PUBLIC_KEY,'latest')
    const gasPrice = await provider.getGasPrice();
    const network = await provider.getNetwork();
    const {chainId} = network;
    const transaction = {
        from : PUBLIC_KEY,
        to : JUGADOR_CONTRACT,
        nonce,
        chainId,
        gasPrice,
        data: etherInterface.encodeFunctionData(method,params)
    }
    return transaction
}

async function addBoleto(denominacion, jugadorId, loteriaId) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    //CONTRATOS AUX
    const jugadorContract = new ethers.Contract(JUGADOR_CONTRACT, jugadorContractArtifact.abi, provider);
    const loteriaContract = new ethers.Contract(LOTERIA_CONTRACT, loteriaContractArtifact.abi, provider);

    //EXISTE JUGADOR
    const jugador = await jugadorContract.getJugadorById(jugadorId);
    if (!jugador.jugadorId.eq(jugadorId)) {
        throw new Error(`El jugador con ID ${jugadorId} no existe`);
    }
    //EXISTE LOTERIA
    const loteria = await loteriaContract.getLoteriaById(loteriaId);
    if (!loteria.loteriaId.eq(loteriaId)) {
        throw new Error(`La loteria con ID ${loteriaId} no existe`);
    }

    //SUMA BOLETO AL JUGADOR
    let nuevaCantidad = jugador.cantidadBoletos.toNumber() + 1 //Sumamos 1 a la cantidad que tenemos
    const transactionJugador = await createTransactionJugador(provider, "buyBoleto", [jugadorId, nuevaCantidad]);
    const estimateGasJugador = await provider.estimateGas(transactionJugador);
    transactionJugador["gasLimit"] = estimateGasJugador;
    const signedTxJugador = await wallet.signTransaction(transactionJugador);
    const transactionReceiptJugador = await provider.sendTransaction(signedTxJugador);
    await transactionReceiptJugador.wait();
    const hashJugador = transactionReceiptJugador.hash;
    console.log("Transaction Hash Boleto Comprado Por Jugador: ", hashJugador);
    const receiptJugador = await provider.getTransactionReceipt(hashJugador);

    //CREAR BOLETO
    const transaction = await createTransaction(provider,"addBoleto",[denominacion,jugadorId,loteriaId]);
    const estimateGas = await provider.estimateGas(transaction);
    transaction["gasLimit"] = estimateGas;
    const singedTx = await wallet.signTransaction(transaction);
    const transactionRecepit = await provider.sendTransaction(singedTx);
    await transactionRecepit.wait();
    const hash = transactionRecepit.hash;
    console.log("Transaction Hash Boleto Creado: ",hash)
    const receipt = await provider.getTransactionReceipt(hash)
    return { receipt, receiptJugador };
}

async function getAllBoletos() {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const boletoContract = new ethers.Contract(BOLETOS_CONTRACT,contract.abi,provider)
    const result = await boletoContract.getAllBoletos()
    var boletos = []
    result.forEach(element => {
        boletos.push(formatBoleto(element))
    })
    return boletos;
}

function formatBoleto(info) {
    return {
        id:ethers.BigNumber.from(info[0]).toNumber(),
        denominacion:info[1],
        jugadorId:ethers.BigNumber.from(info[2]).toNumber(),
        loteriaId:ethers.BigNumber.from(info[3]).toNumber()
    }
}

module.exports = {
    addBoleto:addBoleto,
    getAllBoletos:getAllBoletos
};