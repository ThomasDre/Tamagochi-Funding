const djDetailTemplate = Handlebars.getTemplate('detail/dj-template');

$(document).ready(
    function () {

        $(document).on("click", ".dj_card", async function () {
            const address = $(this).data('address');

            const person = await getPerson(address);
            const context = {
                role: 'owner',
                person: person,
                persons: persons()
            };
            const html = djDetailTemplate(context);

            $('#person_detail').html(html);
        });

        $(document).on("click", "#start-voting-submit", function () {
            const sender_address = $(this).closest(".card").data('address');

            songVotingContractInstance.methods.startVoting().estimateGas({from: sender_address}, function (error, result) {
                if (error) {
                    $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                } else {
                    songVotingContractInstance.methods.startVoting().send({from: sender_address}, showError);
                }
            });
        });

        $(document).on("click", "#stop-voting-submit", function () {
            const sender_address = $(this).closest(".card").data('address');

            songVotingContractInstance.methods.stopVoting().estimateGas({from: sender_address}, function (error, result) {
                if (error) {
                    $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                } else {
                    songVotingContractInstance.methods.stopVoting().send({from: sender_address, gas: result + 10000}, showError);
                }
            });
        });


        $(document).on("click", "#renounce-dj-submit", function () {
            const sender_address = $(this).closest(".card").data('address');

            songVotingContractInstance.methods.renounceDJ().estimateGas({from: sender_address}, function (error, result) {
                if (error) {
                    $.notify({message: '<strong>Gas estimation failed:</strong> ' + error}, {type: 'danger'});
                } else {
                    songVotingContractInstance.methods.renounceDJ().send({from: sender_address}, showError);
                }
            });
        });
    }
);
