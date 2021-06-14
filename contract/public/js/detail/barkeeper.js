const barkeeperDetailTemplate = Handlebars.getTemplate('detail/barkeeper-template');

$(document).ready(
    function () {

        $(document).on("click", ".barkeeper_card", async function () {
            const address = $(this).data('address');

            const person = await getPerson(address);
            const context = {
                role: 'owner',
                person: person,
                persons: persons()
            };
            const html = barkeeperDetailTemplate(context);

            $('#person_detail').html(html);
        });

        $(document).on("click", "#open-bar-submit", function () {
            const sender_address = $(this).closest(".card").data('address');

            songVotingContractInstance.methods.openBar().estimateGas({from: sender_address}, function (error, result) {
                if (error) {
                    $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                } else {
                    songVotingContractInstance.methods.openBar().send({from: sender_address}, showError);
                }
            });
        });

        $(document).on("click", "#close-bar-submit", function () {
            const sender_address = $(this).closest(".card").data('address');

            songVotingContractInstance.methods.closeBar().estimateGas({from: sender_address}, function (error, result) {
                if (error) {
                    $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                } else {
                    songVotingContractInstance.methods.closeBar().send({from: sender_address, gas: result + 50000}, showError);
                }
            });
        });

        $(document).on("click", "#serve-beer-submit", function () {
            const sender_address = $(this).closest(".card").data('address');
            const recipient_address = $(this).closest(".card").find("#serve-beer-recipient-select").val();
            const amount = $(this).closest(".card").find("#serve-beer-quantity").val();

            songVotingContractInstance.methods.serveBeer(recipient_address, amount).estimateGas({from: sender_address}, function (error, result) {
                if (error) {
                    $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                } else {
                    songVotingContractInstance.methods.serveBeer(recipient_address, amount).send({from: sender_address, gas: result + 5000}, showError);
                }
            });
        });

        $(document).on("click", "#renounce-barkeeper-submit", function () {
            const sender_address = $(this).closest(".card").data('address');

            songVotingContractInstance.methods.renounceBarkeeper().estimateGas({from: sender_address}, function (error, result) {
                if (error) {
                    $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                } else {
                    songVotingContractInstance.methods.renounceBarkeeper().send({from: sender_address}, showError);
                }
            });
        });
    }
);
