const ownerDetailTemplate = Handlebars.getTemplate('detail/owner-template');

$(document).ready(
    function () {

        $(document).on("click", ".owner_card", async function () {
            const address = $(this).data('address');

            let beerTokenAddress = "";
            if (beerTokenContractInstance != null) {
                beerTokenAddress = beerTokenContractInstance.options.address;
            }

            const person = await getPerson(address);
            const context = {
                role: 'owner',
                person: person,
                persons: persons(),
                currentBeerPrice: web3.utils.fromWei(await songVotingContractInstance.methods.getBeerPrice().call(), "ether"),
                beerTokenAddress: beerTokenAddress
            };
            const html = ownerDetailTemplate(context);

            $('#person_detail').html(html);
        });

        $(document).on("click", "#supply-beer-submit", function () {
            const sender_address = $(this).closest(".card").data('address');
            const bar_address = $(this).closest("#bar").data('address');
            const amount = $(this).closest(".card").find("#supply-beer-quantity").val();

            if (confirm('Send ' + amount + ' Beertokens from ' + sender_address + ' to ' + bar_address + '?')) {
                beerTokenContractInstance.methods.transfer(bar_address, parseInt(amount), web3.utils.toHex('supply')).estimateGas({from: sender_address}, function (error, result) {
                    if (error) {
                        $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                    } else {
                        beerTokenContractInstance.methods.transfer(bar_address, parseInt(amount), web3.utils.toHex('supply')).send({from: sender_address}, showError);
                    }
                });
            }
        });

        $(document).on("click", "#set-beer-price-submit", function () {
            const sender_address = $(this).closest(".card").data('address');
            const amount = $(this).closest(".card").find("#set-beer-price-quantity").val();
            console.log(amount);
            console.log(typeof amount);

            songVotingContractInstance.methods.setBeerPrice(web3.utils.toWei(amount, 'ether')).estimateGas({from: sender_address}, function (error, result) {
                if (error) {
                    $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                } else {
                    songVotingContractInstance.methods.setBeerPrice(web3.utils.toWei(amount, 'ether')).send({from: sender_address}, showError);
                }
            });
        });

        $(document).on("click", "#payout-submit", function () {
            const sender_address = $(this).closest(".card").data('address');
            const recipient_address = $(this).closest(".card").find("#payout-recipient-select").val();
            const amount = $(this).closest(".card").find("#payout-quantity").val();

            songVotingContractInstance.methods.payout(recipient_address, web3.utils.toWei(amount, 'ether')).estimateGas({from: sender_address}, function (error, result) {
                if (error) {
                    $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                } else {
                    songVotingContractInstance.methods.payout(recipient_address, web3.utils.toWei(amount, 'ether')).send({from: sender_address}, showError);
                }
            });
        });

        $(document).on("click", "#promote-submit", function () {
            const sender_address = $(this).closest(".card").data('address');
            const recipient_address = $(this).closest(".card").find("#promote-recipient-select").val();
            const role = $(this).closest(".card").find("#promote-role-select").val();

            if (role === "barkeeper") {
                songVotingContractInstance.methods.addBarkeeper(recipient_address).estimateGas({from: sender_address}, function (error, result) {
                    if (error) {
                        $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                    } else {
                        songVotingContractInstance.methods.addBarkeeper(recipient_address).send({from: sender_address}, showError);
                    }
                });
            } else if (role === "owner") {
                songVotingContractInstance.methods.addOwner(recipient_address).estimateGas({from: sender_address}, function (error, result) {
                    if (error) {
                        $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                    } else {
                        songVotingContractInstance.methods.addOwner(recipient_address).send({from: sender_address}, showError);
                    }
                });
            } else if (role === 'dj') {
                songVotingContractInstance.methods.addDJ(recipient_address).estimateGas({from: sender_address}, function (error, result) {
                    if (error) {
                        $.notify({message: '<strong>Gas estimation failed:</strong>' + error}, {type: 'danger'});
                    } else {
                        songVotingContractInstance.methods.addDJ(recipient_address).send({from: sender_address}, showError);
                    }
                })
            }
        });

        $(document).on("click", "#renounce-owner-submit", function () {
            const sender_address = $(this).closest(".card").data('address');

            songVotingContractInstance.methods.renounceOwner().estimateGas({from: sender_address}, function (error, result) {
                if (error) {
                    $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                } else {
                    songVotingContractInstance.methods.renounceOwner().send({from: sender_address}, showError);
                }
            });
        });

        $(document).on("click", "#beertoken-address-submit", function () {
            const sender_address = $(this).closest(".card").data('address');
            const beertoken_address = $(this).closest(".card").find("#beertoken-address").val();

            songVotingContractInstance.methods.setBeerTokenContractAddress(beertoken_address).estimateGas({from: sender_address}, function (error, result) {
                if (error) {
                    $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                } else {
                    songVotingContractInstance.methods.setBeerTokenContractAddress(beertoken_address).send({from: sender_address}, showError);
                }
            });
        });
    }
);
