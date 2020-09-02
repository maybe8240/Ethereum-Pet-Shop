pragma solidity ^0.5.0;

contract Adoption {
	//variable declaration
	address[16] public adopters;

    address public owner = msg.sender;

	//Adopting a pet
	function adopt(uint petId) payable public returns (uint) {
		require (petId >= 0 && petId <= 15);
		adopters[petId] = msg.sender;
		return petId;
	}

	// Retreving the adopters
	function getAdopters() public view returns (address[16] memory) {
		return adopters;
	}

	event votedEvent (
        uint indexed _candidateId
    );

    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;

    // Read/write candidates
    mapping(uint => Candidate) public candidates;

    // Store Candidates Count
    uint public candidatesCount;

    constructor() public {
        addCandidate("Scottish Terrier");
        addCandidate("French Bulldog");
        addCandidate("Boxer");
        addCandidate("Golden Retriever");
    }

    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }

}