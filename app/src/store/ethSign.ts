//@ts-nocheck
import Eth from 'ethjs';

export async function sign() {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.enable().catch(console.error);
  }
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];
  console.log({ account });

  const msgParams = [
    {
      type: 'string',
      name: 'Sign in to EduVault from ID: ',
      value: account,
    },
  ];
  try {
    const eth = new Eth(window.ethereum);
    console.log({ eth });

    const signed = await eth.signTypedData(msgParams, account);
    console.log({ signed });
    return { signed, account };
  } catch (error) {
    console.log({ error });
    return error;
  }
}
