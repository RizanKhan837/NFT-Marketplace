'use strict';



/**
 * navbar toggle
 */

const overlay = document.querySelector("[data-overlay]");
const navbar = document.querySelector("[data-navbar]");
const menuCloseBtn = document.querySelector("[data-nav-close-btn]");
const menuOpenBtn = document.querySelector("[data-nav-open-btn]");
const connect = document.querySelector("#wallet");
let buy = document.querySelector(".buy");
const value = parseInt(document.querySelector(".datas").value);
const chainId = 5;
let connected = false;

const elemArr = [overlay, menuCloseBtn, menuOpenBtn];

for (let i = 0; i < elemArr.length; i++) {
  elemArr[i].addEventListener("click", function () {
    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
  });
}

/**
 * toggle navbar when any navbar link will be clicked
 */

const navbarLinks = document.querySelectorAll("[data-navlink]");

for (let i = 0; i < navbarLinks.length; i++) {
  navbarLinks[i].addEventListener("click", function () {
    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
  });
}





/**
 * add active class on header and back-to-top btn
 * when window will scroll 100px from top
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

window.addEventListener("scroll", function () {
  if (window.scrollY >= 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
});

connect.addEventListener("click", async () => {
  if (window.ethereum) {
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(accounts);
      console.log(`Connected with ${accounts[0]}`);
      connect.innerHTML = `${accounts[0].slice(0, 6)}...${accounts[0].slice(
        -4
      )}`;
      connected = true;
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("Install Metamask");
  }
});

if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    // console.log(accounts);
    console.log(`Connected with ${accounts[0]}`);
    connect.innerHTML = `${accounts[0].slice(0, 6)}...${accounts[0].slice(
        -4
      )}`;
  });
}

buy.addEventListener("click", async (e) => {
  console.log("clicked");
  connected = true;
  if (connected) {
    try {
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

    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("Install Metamask");
  }
});