

import { uploadFileToIPFS, uploadJSONToIPFS } from "./pinata.js";

/**
 * navbar toggle
 */

const [formParams, updateFormParams] = useState({ name: '', description: '', price: ''});
const [fileURL, setFileURL] = useState(null);
const ethers = require("ethers");
const [message, updateMessage] = useState('');

const overlay = document.querySelector('[data-overlay]');
const navbar = document.querySelector('[data-navbar]');
const menuCloseBtn = document.querySelector('[data-nav-close-btn]');
const menuOpenBtn = document.querySelector('[data-nav-open-btn]');
const connect = document.querySelector('#wallet');
let buy = document.querySelectorAll('.buy');
//const value = parseInt(document.querySelector(".datas").value);
const chainId = 5;
let connected = false;

const elemArr = [overlay, menuCloseBtn, menuOpenBtn];

for (let i = 0; i < elemArr.length; i++) {
	elemArr[i].addEventListener('click', function () {
		navbar.classList.toggle('active');
		overlay.classList.toggle('active');
	});
}

async function OnChangeFile(e) {
  var file = e.target.files[0];
  //check for file extension
  try {
      //upload the file to IPFS
      const response = await uploadFileToIPFS(file);
      if(response.success === true) {
          console.log("Uploaded image to Pinata: ", response.pinataURL)
          setFileURL(response.pinataURL);
      }
  }
  catch(e) {
      console.log("Error during file upload", e);
  }
}


async function listNFT(e) {
  e.preventDefault();

  //Upload data to IPFS
  try {
      const metadataURL = await uploadMetadataToIPFS();
      //After adding your Hardhat network to your metamask, this code will get providers and signers
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      updateMessage("Please wait.. uploading (upto 5 mins)")

      //Pull the deployed contract instance
      let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer)

      //massage the params to be sent to the create NFT request
      const price = ethers.utils.parseUnits(formParams.price, 'ether')
      let listingPrice = await contract.getListPrice()
      listingPrice = listingPrice.toString()

      //actually create the NFT
      let transaction = await contract.createToken(metadataURL, price, { value: listingPrice })
      await transaction.wait()

      alert("Successfully listed your NFT!");
      updateMessage("");
      updateFormParams({ name: '', description: '', price: ''});
      window.location.replace("/")
  }
  catch(e) {
      alert( "Upload error"+e )
  }
}

//This function uploads the metadata to IPFS
async function uploadMetadataToIPFS() {
  const {name, description, price} = formParams;
  //Make sure that none of the fields are empty
  if( !name || !description || !price || !fileURL)
      return;

  const nftJSON = {
      name, description, price, image: fileURL
  }

  try {
      //upload the metadata JSON to IPFS
      const response = await uploadJSONToIPFS(nftJSON);
      if(response.success === true){
          console.log("Uploaded JSON to Pinata: ", response)
          return response.pinataURL;
      }
  }
  catch(e) {
      console.log("error uploading JSON metadata:", e)
  }
}

/**
 * toggle navbar when any navbar link will be clicked
 */

const navbarLinks = document.querySelectorAll('[data-navlink]');

for (let i = 0; i < navbarLinks.length; i++) {
	navbarLinks[i].addEventListener('click', function () {
		navbar.classList.toggle('active');
		overlay.classList.toggle('active');
	});
}

// Check if MetaMask is installed and enabled
if (typeof window.ethereum !== 'undefined') {
	// Update button text with user's address
	const updateButtonAddress = async () => {
		// request access to the user's MetaMask account
		window.ethereum
			.request({ method: 'eth_requestAccounts' })
			.then((accounts) => {
				// display the user's MetaMask address
				connect.innerHTML = `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;
			})
			.catch((error) => {
				// handle the error
				console.error(error);
			});
	};

	// Call updateButtonAddress when the page is loaded
	window.addEventListener('load', updateButtonAddress);

	// Listen for accounts changed event and update button text
	window.ethereum.on('accountsChanged', updateButtonAddress);
}

/**
 * add active class on header and back-to-top btn
 * when window will scroll 100px from top
 */

const header = document.querySelector('[data-header]');
const backTopBtn = document.querySelector('[data-back-top-btn]');

window.addEventListener('scroll', function () {
	if (window.scrollY >= 100) {
		header.classList.add('active');
		backTopBtn.classList.add('active');
	} else {
		header.classList.remove('active');
		backTopBtn.classList.remove('active');
	}
});

// check if the user is connected to MetaMask
if (connected) {
	// get the user's MetaMask address
	const provider = new ethers.providers.Web3Provider(window.ethereum);
	provider
		.getSigner()
		.getAddress()
		.then((address) => {
			// display the user's MetaMask address
			connect.innerHTML = `${address.slice(0, 6)}...${address.slice(-4)}`;
		})
		.catch((error) => {
			// handle the error
			console.error(error);
		});
}

connect.addEventListener('click', async () => {
	// check if MetaMask is installed
	if (typeof window.ethereum !== 'undefined') {
		// request access to the user's MetaMask account
		window.ethereum
			.request({ method: 'eth_requestAccounts' })
			.then((accounts) => {
				// display the user's MetaMask address
				connect.innerHTML = `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;
			})
			.catch((error) => {
				// handle the error
				console.error(error);
			});

		connected = true;
	} else {
		// handle the case where MetaMask is not installed
		console.error('Please install MetaMask!');
	}
});

if (window.ethereum) {
	window.ethereum.on('accountsChanged', (accounts) => {
		// console.log(accounts);
		console.log(`Connected with ${accounts[0]}`);
		connect.innerHTML = `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;
	});
}

buy.forEach((button) => {
	button.addEventListener('click', async (e) => {
		console.log('clicked');

		const parent = button.closest('.card');

		const dataElement = parent.querySelector('data');

		// get the value of the <data> element and pass it to your function
		const value = parseFloat(dataElement.getAttribute('value'));
		//const value = parseInt(parent.querySelector(".datas").value);

		console.log(value);

		connected = true;
		if (connected) {
			/* try {
        const transactionParameters = {
          nonce: "0x00", // ignored by MetaMask
          gasPrice: "0x09184e72a000", // customizable by user during MetaMask confirmation.
          gas: `0x2710`, // customizable by user during MetaMask confirmation.
          to: '0xBe70f249FF83a6839f08A19Af8B11CFdCBd07cDE', // Required except during contract publications.
          from: ethereum.selectedAddress, // must match user's active address.
          value: `${value.toString(16)}`, // Only required to send ether to the recipient from the initiating external account.
          data: "0x7f7465737432000000000000000000000000000000000000000000000000000000600057", // Optional, but used for defining smart contract creation and interaction.
          chainId: `${chainId.toString(16)}`, // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
        };
  
        // txHash is a hex string
        // As with any RPC call, it may throw an error
        const txHash = await ethereum.request({
          method: "eth_sendTransaction",
          params: [transactionParameters],
        });

        console.log(txHash);
  
      } catch (error) {
        console.log(error);
      } */

			const provider = new ethers.providers.Web3Provider(window.ethereum);

			// Get the signer object
			const signer = provider.getSigner();

			// Send transaction function
			try {
				// Send a transaction
				const tx = await signer.sendTransaction({
					to: '0xBe70f249FF83a6839f08A19Af8B11CFdCBd07cDE', // recipient address
					value: ethers.utils.parseEther(value.toString()), // transaction value (0.1 ETH)
				});
				console.log(tx);
			} catch (err) {
				console.error(err);
			}
		} else {
			console.log('Install Metamask');
		}
	});
});
