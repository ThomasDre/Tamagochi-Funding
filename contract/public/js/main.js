// TODO make new templates
let barTemplate = Handlebars.getTemplate('bar-template');
let footerTemplate = Handlebars.getTemplate('footer-template');
let personTemplate = Handlebars.getTemplate('person-template');

let beerAddress;
let songVotingContractInstance;
let beerTokenContractInstance;




async function renderUI() {
    const contractAddress = $.urlParam('contract');
    // Load UI
    await loadBarContract(contractAddress);
    await Promise.all(
        persons().map(async (person_address) => {
            await addPerson(person_address);
        })
    );
}

async function loadBarContract(address) {
    const barTemplate = await renderBarTemplate(address);
    $('#bar').data('address', address);
    $('#bar').html(barTemplate);

    const footerTemplate = await renderFooterTemplate();
    $('#footer').html(footerTemplate);
}

async function renderBarTemplate(address) {
    const barIsOpen = await songVotingContractInstance.methods.barIsOpen().call();
    const votingIsOpen = await songVotingContractInstance.methods.isOpenVoting().call();
    const ether = web3.utils.fromWei(await web3.eth.getBalance(address), "ether");

    let beerAmount;
    let beerTotalSupply;
    let beerName;
    let beerSymbol;

    if (await isBeerTokenAddressValid()) {
        beerAmount = await beerTokenContractInstance.methods.balanceOf(address).call();
        beerTotalSupply = await beerTokenContractInstance.methods.totalSupply().call();
        beerName = await beerTokenContractInstance.methods.name().call();
        beerSymbol = await beerTokenContractInstance.methods.symbol().call();
    }

    const context = {
        address: address,
        ether: ether,
        barIsOpen: barIsOpen,
        votingIsOpen: votingIsOpen,
        beerAddress: beerAddress,
        beerAmount: beerAmount,
        beerTotalSupply: beerTotalSupply,
        beerName: beerName,
        beerSymbol: beerSymbol,
        songVoting, songVoting,
        selectedSong: selectedSong
    };

    return barTemplate(context);
}

async function renderFooterTemplate() {
    const context = {
        block: await web3.eth.getBlockNumber()
    };

    return footerTemplate(context);
}

async function addPerson(person_address) {
    await addPersonTemplate('person', person_address);

    if (await songVotingContractInstance.methods.isBarkeeper(person_address).call()) {
        await addPersonTemplate('barkeeper', person_address);
    }
    if (await songVotingContractInstance.methods.isOwner(person_address).call()) {
        await addPersonTemplate('dj', person_address);
    }
    if (await songVotingContractInstance.methods.isOwner(person_address).call()) {
        await addPersonTemplate('owner', person_address);
    }
    
}


let showError = function (error, result) {
    if (!error) {
        $.notify('Transaction sent: ' + JSON.stringify(result));
    } else {
        $.notify({message: '<strong>Error:</strong> ' + error}, {type: 'danger'});
    }
};

function Person(address, ether, beerTokens, pendingBeerTokens) {
    this.address = address;
    this.ether = ether;
    this.beertokens = beerTokens;
    this.pendingBeertokens = pendingBeerTokens;
    this.addressShort = this.address.substring(0, 7);
}

async function getPerson(person_address) {
    const ether = web3.utils.fromWei(await web3.eth.getBalance(person_address), "ether");

    let beerTokens;
    if (await isBeerTokenAddressValid()) {
        beerTokens = await beerTokenContractInstance.methods.balanceOf(person_address).call();
    }
    const pendingBeerTokens = await songVotingContractInstance.methods.pendingBeer(person_address).call();

    return new Person(person_address, ether, beerTokens, pendingBeerTokens);
}

function persons() {
    const personAddress = $.urlParam('invite');
    if (!personAddress) {
        return [];
    }
    return personAddress.split(',');
}

async function addPersonTemplate(role, person_address) {
    $("#" + role).parent().find(" .empty ").remove();

    const context = {
        role: role,
        person: await getPerson(person_address),
    };

    const html = personTemplate(context);
    $("#" + role).append(html);
}

function removePersonTemplate(role, person_address) {
    $('.' + role + '_card[data-address=\'' + person_address + '\']').remove();
}

async function isBeerTokenAddressValid() {
    if (beerAddress != 0x0) {
        // Check whether the beerToken address actually points to a corresponding token contract by calling a method.
        return await beerTokenContractInstance.methods.balanceOf('0x0000000000000000000000000000000000000000').call().then(() => {
            return true;
        }).catch(() => {
            console.log("Invalid token contract address!");
            return false;
        });
    }
    console.log("Invalid token contract address!");
    return false;
}


/****************************
 * Entry point
 ***************************/
$(document).ready(
    async function () {
        // Connecting to local node
        const provider = new Web3.providers.WebsocketProvider("ws://localhost:8546");
        const web3 = window['web3'] = new Web3(provider);
        const isConnected = await web3.eth.net.isListening()
        if (!isConnected) {
            alert("Not connected to client!");
            return;
        } else {
            console.log("Connected to client!");
        }

        const contractAddress = $.urlParam('contract');
        if (contractAddress != null) {
            // Check whether bar contract is deployed by checking the code deployed on that address
            const data = await web3.eth.getCode(contractAddress);
            if (data === "0x") {
                alert("No contract deployed on that address!");
                return;
            }

            // Instantiate contracts
            songVotingContractInstance = new web3.eth.Contract(songVotingABI, contractAddress);
            beerAddress = await songVotingContractInstance.methods.beerTokenContractAddress().call();
            console.log("beerTokenAddress: " + beerAddress);
            beerTokenContractInstance = new web3.eth.Contract(beerTokenABI, beerAddress);

            // Start event handlers
            subscribeBlocks();
            listenToContractEvents();

            // Load UI
            await loadBarContract(contractAddress);
            await Promise.all(
                persons().map(async (person_address) => {
                    await addPerson(person_address);
                })
            );
        }


        $("#loadBarSubmit").click(function () {
            const address = $("#address").val();
            window.location.href = updateUrlParameter(window.location.href, 'contract', address);
        });

        $("#mint-token").click(function () {
            let minter = $("#minter").val();
            let receiver = $("#token-receiver").val();
            let amount = $("#minted-amount").val();
            beerTokenContractInstance.methods.mint(receiver,parseInt(amount)).estimateGas({from: minter}, function (error, result) {
                if (error) {
                    $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                } else {
                    beerTokenContractInstance.methods.mint(receiver, parseInt(amount)).send({from: minter}, showError);
                }
            })
        });

        $(document).on("click", ".invite_submit", function () {
            const bar = $(this).closest("#bar");

            const invite_address = bar.find('.invite_address').val();
            console.log("invite_address: " + invite_address);

            const p = persons();
            if (p.indexOf(invite_address) < 0) {
                p.push(invite_address);
            }
            window.location.href = updateUrlParameter(window.location.href, 'invite', p.join());
        });
    }()
);
