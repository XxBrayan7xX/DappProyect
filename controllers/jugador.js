require('dotenv').config({path:require('find-config')('.env')})
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const {ethers} = require('ethers')
const contract = require('../artifacts/contracts/Jugador.sol/Jugadores.json')
const { format } = require('path')
const {
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    API_URL,
    PRIVATE_KEY,
    PUBLIC_KEY,
    JUGADOR_CONTRACT
} = process.env

async function createTransaction(provider,method,params) {
    const etherInterface = new ethers.utils.Interface(contract.abi);
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

async function addJugador(nombre, edad) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const transaction = await createTransaction(provider,"addJugador", [nombre, edad, 0]);//Iniciamos en 0 nuestros boletos
    const estimateGas = await provider.estimateGas(transaction);
    transaction["gasLimit"] = estimateGas;
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const signedTx = await wallet.signTransaction(transaction);
    const transactionReceipt = await provider.sendTransaction(signedTx);
    await transactionReceipt.wait();
    const hash = transactionReceipt.hash;
    console.log("Transaction Hash Jugador Creado: ",hash)
    const receipt = await provider.getTransactionReceipt(hash);
    return receipt;
}

async function getAllJugadores() {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const jugadorContract = new ethers.Contract(JUGADOR_CONTRACT,contract.abi,provider)
    const result = await jugadorContract.getAllJugadores()
    var jugadores = []
    result.forEach(element => {
        jugadores.push(formatJugador(element))
    })
    return jugadores;
}

function formatJugador(info) {
    return {
        id:ethers.BigNumber.from(info[0]).toNumber(),
        nombre:info[1],
        edad:ethers.BigNumber.from(info[2]).toNumber(),
        boletos:ethers.BigNumber.from(info[3]).toNumber()
    }
}

module.exports = {
    addJugador:addJugador,
    getAllJugadores:getAllJugadores
};