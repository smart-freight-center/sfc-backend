import chai from 'chai';
import chaiHttp from 'chai-http';
import sinonChai from 'sinon-chai';
import chaiSubset from 'chai-subset';
import chaiAsPromised from 'chai-as-promised';

export const mochaGlobalSetup = function () {
  chai.should();
  chai.use(chaiHttp);

  chai.use(sinonChai);
  chai.use(chaiSubset);
  chai.use(chaiAsPromised);
};
