// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DecentralizedIdentity is Ownable {
    struct Identity {
        string name;
        string email;
        uint256 age;
        string country;
        bool exists;
    }

    mapping(address => Identity) public identities;
    mapping(address => bool) public registeredAddresses;

    event IdentityCreated(address indexed userAddress, string name);
    event IdentityUpdated(address indexed userAddress, string name);

    function createIdentity(
        string memory _name,
        string memory _email,
        uint256 _age,
        string memory _country
    ) external {
        require(!registeredAddresses[msg.sender], "Identity already exists");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        require(_age > 0, "Age must be greater than 0");

        identities[msg.sender] = Identity({
            name: _name,
            email: _email,
            age: _age,
            country: _country,
            exists: true
        });

        registeredAddresses[msg.sender] = true;
        emit IdentityCreated(msg.sender, _name);
    }

    function updateIdentity(
        string memory _name,
        string memory _email,
        uint256 _age,
        string memory _country
    ) external {
        require(registeredAddresses[msg.sender], "Identity does not exist");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        require(_age > 0, "Age must be greater than 0");

        identities[msg.sender] = Identity({
            name: _name,
            email: _email,
            age: _age,
            country: _country,
            exists: true
        });

        emit IdentityUpdated(msg.sender, _name);
    }

    function getIdentity(address _userAddress) external view returns (Identity memory) {
        require(registeredAddresses[_userAddress], "Identity does not exist");
        return identities[_userAddress];
    }

    function deleteIdentity() external {
        require(registeredAddresses[msg.sender], "Identity does not exist");
        delete identities[msg.sender];
        registeredAddresses[msg.sender] = false;
    }
}