class Dummy {
  private testNumber = 3;
  getTest = () => this.testNumber;
}

const dum = new Dummy();
console.log(dum.getTest());

export default Dummy;
