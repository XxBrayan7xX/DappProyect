// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Boletos is Ownable{
    using Counters for Counters.Counter;
    Counters.Counter private _boletoIds;

    struct Boleto{
        uint256 boletoId;
        string denominacion;
        uint256 jugadorId;
        uint256 loteriaId;
    }

    mapping(uint256 => Boleto)public boletos;

    function addBoleto(string memory denominacion, uint256 jugadorId, uint256 loteriaId)public onlyOwner returns(uint256){
        _boletoIds.increment();
        uint256 newBoletoId = _boletoIds.current();
        Boleto memory newBoleto = Boleto(newBoletoId, denominacion, jugadorId, loteriaId);
        boletos[newBoletoId] = newBoleto;
        return newBoletoId;
    }

    function getAllBoletos()public view returns(Boleto[] memory){
        Boleto[] memory boletosArray = new Boleto[](_boletoIds.current());
        for(uint256 i = 0; i < _boletoIds.current(); i++){
            boletosArray[i] = boletos[i + 1];
        }
        return boletosArray;
    }
}