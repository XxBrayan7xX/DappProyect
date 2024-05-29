require('dotenv').config({path:require('find-config')('.env')})
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const {ethers} = require('ethers')
const contract = require('../artifacts/contracts/Loteria.sol/Loterias.json')
const { format } = require('path')
const {
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    API_URL,
    PRIVATE_KEY,
    PUBLIC_KEY,
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
        to : LOTERIA_CONTRACT,
        nonce,
        chainId,
        gasPrice,
        data: etherInterface.encodeFunctionData(method,params)
    }
    return transaction
}

async function addLoteria(nombre, nombreCreador) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const transaction = await createTransaction(provider, "addLoteria", [nombre, nombreCreador]);
    const estimateGas = await provider.estimateGas(transaction);
    transaction["gasLimit"] = estimateGas;
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const signedTx = await wallet.signTransaction(transaction);
    const transactionReceipt = await provider.sendTransaction(signedTx);
    await transactionReceipt.wait();
    const hash = transactionReceipt.hash;
    console.log("Transaction Hash Loteria Creada: ",hash)
    const receipt = await provider.getTransactionReceipt(hash);
    return receipt;
}

async function changeNombre(id, nombre) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    console.log("ID: ",id)
    const transaction = await createTransaction(provider,"changeNombre", [id, nombre]);
    const estimateGas = await provider.estimateGas(transaction);
    transaction["gasLimit"] = estimateGas;
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const signedTx = await wallet.signTransaction(transaction);
    const transactionReceipt = await provider.sendTransaction(signedTx);
    await transactionReceipt.wait();
    const hash = transactionReceipt.hash;
    console.log("Transaction Hash Nombre De Loteria Cambiado: ",hash)
    const receipt = await provider.getTransactionReceipt(hash);
    return receipt;
}

async function getAllLoterias() {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const loteriaContract = new ethers.Contract(LOTERIA_CONTRACT,contract.abi,provider)
    const result = await loteriaContract.getAllLoterias()
    var loterias = []
    result.forEach(element => {
        loterias.push(formatLoteria(element))
    })
    return loterias;
}

function formatLoteria(info) {
    return {
        id:ethers.BigNumber.from(info[0]).toNumber(),
        nombre:info[1],
        nombreCreador:info[2]
    }
}


module.exports = {
    addLoteria:addLoteria,
    getAllLoterias:getAllLoterias,
    changeNombre:changeNombre
};