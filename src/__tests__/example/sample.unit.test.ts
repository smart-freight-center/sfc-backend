import { someUsecase } from './sample';

/*
To be deleted
*/
describe('Unit tests setup', () => {
  it('should run tests successfully', () => {
    someUsecase('example').should.be.eql('example 50');
  });
});
