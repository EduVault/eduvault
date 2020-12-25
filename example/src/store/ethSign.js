//@ts-nocheck
import ethUtil from 'ethereumjs-util';
import sigUtil from 'eth-sig-util';
import Eth from 'ethjs';

window.Eth = Eth;
console.log('new V2');
// const fs = require('fs');
// const terms = fs.readFileSync(__dirname + '/terms.txt').toString();

function connect() {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.enable().catch(console.error);
  }
}

export function ethSign() {
  const web3 = window.web3;
  if (!web3) return null;
  const from = web3.eth.accounts[0];
  if (!from) return connect();
  const msgParams = [
    {
      type: 'string',
      name: 'Sign in to EduVault from ID',
      value: from,
    },
  ];
  // console.log('CLICKED, SENDING PERSONAL SIGN REQ');
  try {
    const eth = new Eth(web3.currentProvider);

    return eth.signTypedData(msgParams, from).then(signed => {
      // console.log('Signed!  Result is: ', signed);
      return signed;
    });
  } catch (err) {
    return err.message;
  }
}

export function compareSig(signed) {
  const web3 = window.web3;
  if (!web3) return null;
  const from = web3.eth.accounts[0];
  if (!from) return connect();
  const msgParams = [
    {
      type: 'string',
      name: 'Sign from ID',
      value: from,
    },
  ];
  const recovered = sigUtil.recoverTypedSignature({ data: msgParams, sig: signed });

  if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)) {
    // alert('Successfully ecRecovered signer as ' + from);
    return true;
  } else {
    return false;
    // alert('Failed to verify signer when comparing ' + signed + ' to ' + from);
  }
}
