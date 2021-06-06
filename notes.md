- fundraising is deployed via the board for each participating organisation
- DEPLOYMENT COSTS of this contract is critical (else it might be better to put all in a single contract that is deployed by myself)

- Access from OpenZeppelin used to control the rights
- access-right scheme maybe bit too verbose (e.g. token contract has 2 admins, me and also the original board contract is an admin)
- why? because the board contract authorizes fundraising platforms on behalf of the owner (me)
- NOTE: dependency within deployments because of that (tamagochi takes the address of board in its constructor)
- ALTERNATIVE: executing calls in behalf of the actual owner: delegatecall could be an option but it did not really work....


- parts of the imple can not be finished (e.g. appearance of the tamagochis, behaviour, these aspects are simply mocked for the submission and 
    and will be implemented later)


- usage of a pseudo random value when generating new erc721 tokens (is that the right way to do it?!?)
- keccak256(packed(blocknumber, tx.origin))


- a lot of things happen on behalf of somebody else... leads to obscurity and 
