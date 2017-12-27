import React, { Component } from 'react'
import VotingContract from '../build/contracts/Voting.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'
// import { debug } from 'util';

// const contractAddress = "0x3e7eb1b8d53621263d40db915205b034568a7933";
var votingContractInstance;
var account;

var _modifyVotingCount = (candidates, i, votingCount) => {

  console.log("---------");
  console.log(candidates);
  console.log(i);
  console.log(votingCount);

  let obj = candidates[i];
  obj.votingCount = votingCount;
  return candidates;
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      candidates: [
        {
          "name": "Caskia",
          "id": 100,
          "votingCount": 0
        },
        {
          "name": "Lucy",
          "id": 101,
          "votingCount": 0
        },
        {
          "name": "Lily",
          "id": 102,
          "votingCount": 0
        },
        {
          "name": "Anya",
          "id": 103,
          "votingCount": 0
        }
      ],
      candidatesVoteCount: ["0", "0", "0", "0"],
      web3: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })

        // Instantiate contract once web3 provided.
        this.instantiateContract()
      })
      .catch(() => {
        console.log('Error finding web3.')
      })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const votingContract = contract(VotingContract)
    votingContract.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on Voting.

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      //votingContract.at(contractAddress)
      votingContract.deployed().then((instance) => {
        account = accounts[0];
        votingContractInstance = instance;

        votingContractInstance.Voted().watch(function (err, result) {
          if (!error) {
            console.log(`candidate[${result.args.candidate}] is voted!`);
          }
        });

        for (let i = 0; i < this.state.candidates.length; i++) {
          let object = this.state.candidates[i];
          console.log(accounts[0]);
          console.log(votingContractInstance);
          console.log(votingContractInstance.totalVotesFor(object.name));
          votingContractInstance.totalVotesFor(object.name).then(result => {
            console.log(i);
            console.log(result.toString());
            this.setState({
              candidates: _modifyVotingCount(this.state.candidates, i, result.toString())
            });
          });
        }
      })
    })
  }

  render() {
    return (
      <div className="App">
        <ul>
          {
            this.state.candidates.map((object) => {
              console.log(object);
              return (

                <li key={object.id}>候选人：{object.name}          支持票数：{object.votingCount}</li>
              )
            })
          }
        </ul>

        <input style={{}}
          placeholder="请输入候选人姓名..."
          ref="candidateInput"
        />

        <button style={{}} onClick={() => {
          console.log(this.refs.candidateInput);
          console.log(this.refs.candidateInput.value);
          let candidateName = this.refs.candidateInput.value;
          console.log(this.state.web3.eth.accounts[0]);
          votingContractInstance.voteForCandidate(candidateName, { from: account }).then((result => {
            console.log(result);
            console.log(candidateName);
            let number = 0;
            for (let i = 0; i < this.state.candidates.length; i++) {
              let object = this.state.candidates[i];
              if (object.name === candidateName) {
                number = i;
                break;
              }
            }
            votingContractInstance.totalVotesFor(candidateName).then(result => {

              this.setState({
                candidates: _modifyVotingCount(this.state.candidates, number, result.toString())
              });
            });

          }));
        }}>Voting</button>

      </div>
    );
  }
}

export default App
