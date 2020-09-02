## Ethereum Pet Shop

The Dapp project is built basing on the pet shop tutorial and the election tutorial. All functionalities of the two tutorials are reproduced, besides, more features are added to the template of pet shop.

As a pet shop, the first thing the user can do is to adopt dogs and pay for them. Also, on the side bar, some status of the pet shop is shown. And everyone is able to vote for their favorite dog breed on this website.

The user interface is shown in screenshot below.

![webpage](https://github.com/maybe8240/Ethereum-Pet-Shop/blob/master/webpage.png)

When a user connects Metamask to the website using his Ethereum account, the account address will be shown in the welcome message. There are 16 dogs waiting to be adopted, and each one of them has their own price.

After clicking “Adopt” button, the user’s address will be written into contract, and he pays for the transaction AND the dog. The money of dog price will be credited to the account of the shop owner, which is the address of the contract.

After the adoption process is finished, the shop status is updated, and one can read the number of clients, adopted dogs, and the number of dogs adopted by himself.

Only the adopters are counted as clients, however, no matter if an account is a client, each account has ONE chance to vote for his favorite dog breed. After clicking “Vote”, the account and the vote count will be written into the contract, and the user need to pay the gas fee. After one voted, the vote button will be hidden to prevent him from voting again. The verification is also done in the contract, thus, even if a user find a way to vote again, it will not be admitted by the contract, and the vote will not be counted.

The project made significant improvement in both front end (app.js and index.html) and contract (Adoption.sol) comparing to the original tutorial, and made use of many different functions of web3 module.
