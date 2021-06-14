// Update all balances on every block
const subscribeBlocks = function () {
    // Subscribe to new blocks
    const ethSubscription = web3.eth.subscribe('newBlockHeaders', async function (error, result) {
        console.log("New block mined");

        if (!error) {
            console.log(result);
            // Check if beerToken has changed
            const newAddress = (await songVotingContractInstance.methods.beerTokenContractAddress().call());
            if (beerAddress !== newAddress) {
                console.log("Unsubscribing from blocks...");
                ethSubscription.unsubscribe();
                // refresh whole page
                window.location.reload(true);
                return;
            }

            // Update blockNumber
            $(".current-block").html(await web3.eth.getBlockNumber());

            const addresses = [songVotingContractInstance.options.address].concat(persons());

            // Update balances and pending-beer-status for all addresses
            addresses.map(async function (address) {
                $(".eth-balance-" + address).html(web3.utils.fromWei((await web3.eth.getBalance(address)), "ether"));
                $(".pending-beertoken-balance-" + address).html(await songVotingContractInstance.methods.pendingBeer(address).call());
            });

            if (await isBeerTokenAddressValid()) {
                addresses.map(async function (address) {
                    $(".beertoken-balance-" + address).html(await beerTokenContractInstance.methods.balanceOf(address).call());
                });
            }
        } else {
            $.notify({message: '<strong>Error:</strong> ' + error}, {type: 'danger'});
        }
    });
}

const listenToContractEvents = function () {
    console.log("Listening for contract events...");

    songVotingContractInstance.events.BarOpened(function (error, result) {
        console.log('got barOpenedEvent!');
        if (!error) {
            $(".bar-state").html("OPEN");
            $(".bar-state").css("background-color", "#2ECC40");
        } else {
            $.notify({message: '<strong>Error:</strong> ' + error}, {type: 'danger'});
        }
    });

    songVotingContractInstance.events.BarClosed(function (error, result) {
        console.log('got barClosedEvent!');
        if (!error) {
            $(".bar-state").html("CLOSED");
            $(".bar-state").css("background-color", "#FF4136");
        } else {
            $.notify({message: '<strong>Error:</strong> ' + error}, {type: 'danger'});
        }
    });

    songVotingContractInstance.events.VotingStarted(function (error, result) {
        console.log('got votingStartedEvent!');
        if (!error) {
            // initialize a new votting
            songVoting = [];

            $(".voting-state").html("SONGVOTING OPEN");
            $(".voting-state").css("background-color", "#2ECC40");

            renderUI();
        } else {
            $.notify({message: '<strong>Error:</strong> ' + error}, {type: 'danger'});
        }
    });

    songVotingContractInstance.events.VotingEnded(async function (error, result) {
        console.log('got votingEndedEvent!');

        if (!error) {
            selectedSong = await songVotingContractInstance.methods.getCurrentSong().call();

            $(".voting-state").html("SONGVOTING CLOSED");
            $(".voting-state").css("background-color", "#FF4136");

            renderUI();
        } else {
            $.notify({message: '<strong>Error:</strong> ' + error}, {type: 'danger'});
        }
    });

    songVotingContractInstance.events.VoteReceived(async function (error, result) {
        console.log('got voteReceivedEvent!');

        if (!error) {
            let songVotedFor = result.returnValues.song;
            let songAlreadyProposed = false; 

            for (let i = 0; i < songVoting.length; i++) {  
                if (songVoting[i].name === songVotedFor) {
                    songAlreadyProposed = true;
                    songVoting[i].count++;
                }
            }

            if (!songAlreadyProposed) {
                let song = new Song(songVotedFor);
                songVoting.push(song);
            }

            for (let i = 0; i < songVoting.length; i++) {
                console.log(songVoting[i].name);
                console.log(songVoting[i].count);
            }

            renderUI();

        } else {
            $.notify({message: '<strong>Error:</strong> ' + error}, {type: 'danger'});
        }
    });

    songVotingContractInstance.events.OwnerAdded(function (error, result) {
        console.log('got ownerAddedEvent!');
        if (!error) {
            console.log(result);
            addPersonTemplate("owner", result.returnValues.account);
        } else {
            $.notify({message: '<strong>Error:</strong> ' + error}, {type: 'danger'});
        }
    });

    songVotingContractInstance.events.BarkeeperAdded(function (error, result) {
        console.log('got BarkeeperAddedEvent!');
        if (!error) {
            console.log(result);
            addPersonTemplate("barkeeper", result.returnValues.account);
        } else {
            $.notify({message: '<strong>Error:</strong> ' + error}, {type: 'danger'});
        }
    });

    songVotingContractInstance.events.DJAdded(function (error, result) {
        console.log('got DJAddedEvent!');
        if (!error) {
            console.log(result);
            addPersonTemplate("dj", result.returnValues.account);
        } else {
            $.notify({message: '<strong>Error:</strong> ' + error}, {type: 'danger'});
        }
    });

    songVotingContractInstance.events.OwnerRemoved(function (error, result) {
        console.log('got ownerRemovedEvent!');
        if (!error) {
            console.log(result);
            removePersonTemplate("owner", result.returnValues.account);
        } else {
            $.notify({message: '<strong>Error:</strong> ' + error}, {type: 'danger'});
        }
    });

    songVotingContractInstance.events.BarkeeperRemoved(function (error, result) {
        console.log('got barkeeperRemovedEvent!');
        if (!error) {
            console.log(result);
            removePersonTemplate("barkeeper", result.returnValues.account);
        } else {
            $.notify({message: '<strong>Error:</strong> ' + error}, {type: 'danger'});
        }
    });

    songVotingContractInstance.events.DJRemoved(function (error, result) {
        console.log('got djRemovedEvent!');
        if (!error) {
            console.log(result);
            removePersonTemplate("dj", result.returnValues.account);
        } else {
            $.notify({message: '<strong>Error:</strong> ' + error}, {type: 'danger'});
        }
    });


}
