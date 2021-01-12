export * as number from './lib/number';
import * as number from './lib/number';
class Dummy {
  private testNumber = number.double(2);
  getTest = () => this.testNumber;
}

const dum = new Dummy();
console.log(dum.getTest());
