// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Jugadores is Ownable{
    using Counters for Counters.Counter;
    Counters.Counter private _jugadorIds;

    struct Jugador{
        uint256 jugadorId;
        string nombre;
        uint256 edad;
        uint256 cantidadBoletos;
    }
    mapping(uint256 => Jugador)public jugadores;

    function addJugador(string memory nombre, uint256 edad, uint cantidadBoletos)public onlyOwner returns(uint256){
        _jugadorIds.increment();
        uint256 newJugadorId = _jugadorIds.current();
        Jugador memory newJugador = Jugador(newJugadorId, nombre, edad, cantidadBoletos);
        jugadores[newJugadorId] = newJugador;
        return newJugadorId;
    }

    function buyBoleto(uint256 jugadorId, uint256 cantidad)public onlyOwner{
        require(jugadorId <= _jugadorIds.current(), "Jugador no existe");
        jugadores[jugadorId].cantidadBoletos = cantidad;
    }

    function getAllJugadores() public view returns(Jugador[] memory){
        Jugador[] memory jugadoresArray = new Jugador[](_jugadorIds.current());
        for(uint256 i; i < _jugadorIds.current(); i++){
            jugadoresArray[i] = jugadores[i + 1];
        }
        return jugadoresArray;
    }

    function getJugadorById(uint256 jugadorId) public view returns (Jugador memory) {
        require(jugadorId <= _jugadorIds.current(), "Jugador no existe");
        return jugadores[jugadorId];
    }
}