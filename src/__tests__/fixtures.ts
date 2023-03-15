import chai from 'chai';
import chaiHttp from 'chai-http';

export const mochaGlobalSetup = function () {
  chai.should();
  chai.use(chaiHttp);
};
