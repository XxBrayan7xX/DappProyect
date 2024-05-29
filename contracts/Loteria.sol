// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Loterias is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _loteriaId;

    struct Loteria{
        uint256 loteriaId;
        string nombreLoteria;
        string nombreCreador;
    }

    mapping(uint256 => Loteria) public loterias;

    function addLoteria(string memory nombreLoteria, string memory nombreCreador)public onlyOwner returns(uint256){
        _loteriaId.increment();
        uint256 newLoteriaId = _loteriaId.current();
        Loteria memory newLoteria = Loteria(newLoteriaId, nombreLoteria, nombreCreador); 
        loterias[newLoteriaId] = newLoteria;
        return newLoteriaId;
    }

    function changeNombre(uint256 loteriaId, string memory nombre)public onlyOwner{
        require(loteriaId <= _loteriaId.current(), "Loteria no existe");
        loterias[loteriaId].nombreLoteria = nombre;
    }

    function getAllLoterias() public view returns(Loteria[] memory){
        Loteria[] memory loteriaArray = new Loteria[](_loteriaId.current());
        for(uint256 i = 0; i < _loteriaId.current(); i++){
            loteriaArray[i] = loterias[i + 1];
        }
        return loteriaArray;
    }

    function getLoteriaById(uint256 loteriaId) public view returns (Loteria memory) {
        require(loteriaId <= _loteriaId.current(), "Loteria no existe");
        return loterias[loteriaId];
    }
}

