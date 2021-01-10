export default class DummyClass {
  test = 'I am a new module!';
  getTest = () => this.test;
}

const dummy = new DummyClass();
console.log(dummy.getTest());
