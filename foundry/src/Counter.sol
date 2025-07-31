// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Counter {
    uint256 private _value;
    address public owner;

    event ValueChanged(uint256 newValue);

    constructor() {
        owner = msg.sender;
    }

    function increment() public {
        _value += 1;
        emit ValueChanged(_value);
    }

    function decrement() public {
        require(_value > 0, "Counter: cannot decrement below zero");
        _value -= 1;
        emit ValueChanged(_value);
    }

    function getValue() public view returns (uint256) {
        return _value;
    }

    function reset() public {
        require(msg.sender == owner, "Counter: only owner can reset");
        _value = 0;
        emit ValueChanged(_value);
    }
}