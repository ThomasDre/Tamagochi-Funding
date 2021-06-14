const personDetailTemplate = Handlebars.getTemplate('detail/person-template');

$(document).ready(
    function() {

        $(document).on("click", ".person_card", async function () {
            const address = $(this).data('address');

            const person = await getPerson(address);
            const context = {
                role: 'person',
                person: person,
            };
            const html = personDetailTemplate(context);

            $('#person_detail').html(html);
        });

        $(document).on("click", "#buy-beer-submit", function () {
            const sender_address = $(this).closest(".card").data('address');
            const bar_address = $(this).closest("#bar").data('address');
            const amount = $(this).closest(".card").find("#buy-beer-quantity").val();

            if (confirm('Send ' + amount + ' Beertokens from ' + sender_address + ' to ' + bar_address + '?')) {
                beerTokenContractInstance.methods.transfer(bar_address, parseInt(amount)).estimateGas({from: sender_address}, function (error, result) {
                    if (error) {
                        $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                    } else {
                        beerTokenContractInstance.methods.transfer(bar_address, parseInt(amount)).send({from: sender_address, gas: result + 5000}, showError);
                    }
                });
            }
        });

        $(document).on("click", "#cancel-beer-submit", function () {
            const sender_address = $(this).closest(".card").data('address');
            const amount = $(this).closest(".card").find("#cancel-beer-quantity").val();

            songVotingContractInstance.methods.cancelOrder(parseInt(amount)).estimateGas({from: sender_address}, function (error, result) {
                if (error) {
                    $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                } else {
                    songVotingContractInstance.methods.cancelOrder(parseInt(amount)).send({from: sender_address}, showError);
                }
            });
        });

        $(document).on("click", "#buy-beertoken-submit", async function () {
            const sender_address = $(this).closest(".card").data('address');
            const bar_address = $(this).closest("#bar").data('address');
            const amount = $(this).closest(".card").find("#buy-beertoken-quantity").val();

            const beerPrice = await songVotingContractInstance.methods.getBeerPrice().call();
            const priceForABeerInWei = web3.utils.toBN(beerPrice).mul(web3.utils.toBN(amount));

            if (confirm('Send ' + web3.utils.fromWei(priceForABeerInWei) + ' ETH from ' + sender_address + ' to ' + bar_address + '?')) {
                songVotingContractInstance.methods.buyToken().estimateGas({from: sender_address, value: priceForABeerInWei}, function(error, result) {
                    if (error) {
                        $.notify({message: '<strong>Gas estimation failed:</strong> ' + error},{type: 'danger'});
                    } else {
                        songVotingContractInstance.methods.buyToken().send({from: sender_address, value: priceForABeerInWei}, showError);
                    }
                });
            }
        });

        $(document).on("click", "#vote-submit", async function () {
            const sender_address = $(this).closest(".card").data('address');
            const bar_address = $(this).closest("#bar").data('address');
            const amount = $(this).closest(".card").find("#vote-beertoken-quantity").val();
            const songName = $(this).closest(".card").find("#voted-song-input").val();

            const beerPrice = await songVotingContractInstance.methods.getBeerPrice().call();
            const priceForABeerInWei = web3.utils.toBN(beerPrice).mul(web3.utils.toBN(amount));

            if (confirm('Send ' + web3.utils.fromWei(priceForABeerInWei) + ' ETH from ' + sender_address + ' to ' + bar_address + '?')) {
                songVotingContractInstance.methods.voteForSong(songName).estimateGas({from: sender_address, value: priceForABeerInWei}, function(error, result) {
                    if (error) {
                        $.notify({message: '<strong>Gas estimation failed:</strong> ' + error},{type: 'danger'});
                    } else {
                        songVotingContractInstance.methods.voteForSong(songName).send({from: sender_address, value: priceForABeerInWei, gas: result + 10000}, showError);
                    }
                });
            }
        });

    }
);
