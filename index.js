import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log(ethers)
console.log(abi)

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        console.log("Connected to Metamask!")
        //document.getElementById("connectButton").innerHTML = "Connected!"
        connectButton.innerHTML = "Connected!"
    } else {
        console.log("No metamask...")
        //document.getElementById("connectButton").innerHTML ="Please install Metamask"
        connectButton.innerHTML = "Please install Metamask"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    //const ethAmount = "78" // just for now
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        // provider / connection to the blockchain
        // Web3Provider: https://docs.ethers.io/v5/api/providers/other/#Web3Provider
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        console.log(provider)

        // signer / wallet  / someone with some gas
        const signer = provider.getSigner()
        console.log(signer)
        // contract that we are interacting with ABI & Address
        const contract = new ethers.Contract(contractAddress, abi, signer)
        console.log(contract)

        const amt = ethers.utils.parseEther(ethAmount)
        console.log(`ethAmount after parse: ${amt}`)
        try {
            const transactionResponse = await contract.fund({
                value: amt,
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}... `)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function withdraw() {
    if (typeof window.ethereum !== undefined) {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //const balance = await provider.getBalance(contractAddress)
        //console.log(ethers.utils.formatEther(balance))
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
