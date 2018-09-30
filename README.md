# SelfKey NodeJS Demo

### Demo Exchange Platform for Integration With SelfKey Marketplace and Login with SelfKey

## Overview

The SelfKey NodeJS Demo (_B*Trade_) is a mock web application that is used for integration testing for the Login w/ SelfKey (LWS) system and the SelfKey Marketplace.  It's built on NodeJS and Express, serves static renders of pages and manages authentication and session using the PassportJS library.  

LWS currently provides 3 NPM packages along with some custom configuration to integrate.  There is passport-selfkey which is a Strategy library to integrate LWS with the auth and session management provided by the Passport library.  There is selfkey.js which is a collection of functions related to generating and verifying the cryptographic signatures used by LWS as well as additional helper functions.  

Most recently we've released another library that focuses on DID and connects with the Ethereum blockchain to verify addresses and DID formatting for the SelfKey Method.  This functionality is provided in the selfkey.js library as a dependency to reduce the required packages needing to be installed manually.

## How it works

### Install
* Clone the repository to your local machine
* Run `npm i` to install package dependencies
* Check to make sure you have updated your bash_profile to provide the required environment variables needed to run the app
* Use the command `npm run dev` to start the app
* You should be able to see the homepage running on localhost:3000

### Environemnt Vairables
```
SK_PORT=3000
SK_URL=https://yoursite.com
SK_API_URL=http://yoursite.com/api/v1
SK_SVS_URL=http://yoursite.com/svs
SK_MONGO_URI=mongodb://localhost:27017/yourdb
SK_MONGO_USER=dbuser
SK_MONGO_PASS=pass1234
SK_SESSION_SECRET=secret1234
```

### LWS Integration

In order to allow users to use LWS to authenticate, there are 2 components which must be installed and running on the users system: 

* SelfKey Identity Wallet
* SelfKey Browser Extension

The SelfKey Identity Wallet (IDW) is a fully functioning Ethereum wallet that supports ERC20 tokens and a number of other features.  For integration with LWS we've added the ability to communicate and pass data from the IDW to the SelfKey Browser Extension (BE)

In its current implementation, the BE is able to get the list of available Ether wallets managed by the wallet, remotely unlock the keystore file directly via the BE and finally it can pull the ID attributes of a selected wallet and pass along that information to the exchange.

Below the surface we've added some basic support for DID formatting and resolving in the form of a DID resolver tool and implementing data structures for Claim and Credentials objects, which are developed following the W3C DID specification.  

### Usage

Once you have Bennytrade installed and running, the IDW installed and running and the BE source files served and enabled in the web browser, you'll be able to start testing the user flow for LWS.  There are error handling messages for cases where either the IDW or BE are not running with instructions on how to proceed.  Assuming everything is running the experience for the user is fairly simple and straightforward.
* Click "Login with SelfKey"
* Select a Wallet
* Unlock the wallet if needed
* Verify the information being sent to Bennytrade
* Submit the information and initiate the authentication process
* Successfully redirected to the Bennytrade dashboard

Behind the scenes there is a lot happening here.  The IDW creates a signature from the wallet private key and a claims object which contains the claim data including the requested attributes and the wallet address being used to authenticate.  The IDW then checks that the wallet is unlocked and then creates a signature from the claim object and private key.  That signature is added to the "proof" object which is sent to the Bennytrade server inside a credentials object.  Now the selfkey-passport library is configured to manage a few different cases including if a user account already exists (in which case the wallet address is linked to that user object) as well as creating new account and simply logging into an existing account.  The selfkey.js library is integrated into the process and provides the means to verify the credentials object that includes the DID and signature.

If everything goes well during this process, the user will be successfully authenticated into the app.  If at any point in the process something goes wrong, the authentication process will fail.  Security is paramount in this process and we are performing continuous security auditing and review throughout the development and release cycles.  


## Contributing

Please see the [contributing notes](CONTRIBUTING.md)

## License

[The GPL-3.0 License](http://opensource.org/licenses/GPL-3.0)

Copyright (c) 2018 SelfKey Foundation [https://selfkey.org/](https://selfkey.org/)
