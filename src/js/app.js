App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.pet-price').text(data[i].price);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);


        petsRow.append(petTemplate.html());
      }

    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
      $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

    }).done(function () {
      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    }).done(function () {
      // Use our contract to retrieve and mark the adopted pets
      return App.bindEvents();
    });
  },

  bindEvents: function() {
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        $("#clientAdd").text(account);
      }
      return App.background();
    });
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  background: function(adopters, account) {
    //voting
    var electionInstance;
    var content = $("#content");

    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Adoption.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candArray = [];
      for (var i = 1; i <= candidatesCount; i++) {
        candArray.push(electionInstance.candidates(i));
      }
      Promise.all(candArray).then(function(values) {
          var candidatesResults = $("#candidatesResults");
          candidatesResults.empty();

          var candidatesSelect = $('#candidatesSelect');
          candidatesSelect.empty();
        for (var i = 0; i < candidatesCount; i++) {
          var id = values[i][0];
          var name = values[i][1];
          var voteCount = values[i][2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        }
      });
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });

    //status
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;        
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      var adoptionCount = 0;
      var adoptRes = {};
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          //Count the number of pets that has been adopted
          adoptionCount += 1;
          var adopter = adopters[i];
          adoptRes[adopter] = (adoptRes[adopter] +1 ) || 1;
        }
        $('#adoptionNum').text(adoptionCount);
      }
      //load account
      web3.eth.getCoinbase(function(err, account) {
        var clientAddr = account;
        var clientAdoptCount = adoptRes[clientAddr];
        $('#clientAdoptNum').text(clientAdoptCount || 0);
        var jslength=0;
        for(var json in adoptRes){
          jslength++;
        }
        $('#clientNum').text(jslength);
      });
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  castVote: function() {
    var electionInstance;
    var candidateId = $('#candidatesSelect').val();

    App.contracts.Adoption.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      alert("Congratulations! You have voted for your favorite dog! Please refresh to see the result.");
      $('form').hide();
    }).catch(function(err) {
      console.error(err);
    });
  },

  markAdopted: function(adopters, account) {
      var adoptionInstance;

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
        
        return adoptionInstance.getAdopters.call();
      }).then(function(adopters) {
        var adoptionCount = 0;
        for (i = 0; i < adopters.length; i++) {
          if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
            //Count the number of pets that has been adopted
            adoptionCount += 1;
            $('#adoptionNum').text(adoptionCount);
            $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
          }
        }
        return App.background();
      }).catch(function(err) {
        console.log(err.message);
      });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    var transit_amount;

    var account

    App.contracts.Adoption.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.owner();
    }).then(function(owner) {

      web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      account = accounts[0];
      var contract_address = owner;
      console.log(contract_address);

      $.getJSON('../pets.json', function(data) {
        transit_amount = data[petId].price;
        web3.eth.sendTransaction({
          from:account,
          to:contract_address,
          value:web3.toWei(transit_amount, "ether")
        }, 
          function(err, transactionHash) {
            if (!err)
              console.log(transactionHash); 
          });
        });

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {

        adoptionInstance = instance;
        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});



