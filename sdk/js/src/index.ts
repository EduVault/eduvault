export * as number from './lib/number';
import { checkKeyStorage } from './lib/checkKeyStorage';
export class EduVault {
  checkKeyStorage = checkKeyStorage;
  thing = 'things';
}
export const eduvault = new EduVault();
// export default eduvault;
