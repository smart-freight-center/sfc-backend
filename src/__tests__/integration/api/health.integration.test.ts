import chai from 'chai';
import { testServer } from '__tests__/testserver';

describe('Health Test', () => {
  it('should return status of ok', async () => {
    const res = await chai.request(testServer).get('/health');
    res.status.should.be.eql(200);
    res.body.should.be.eql({
      status: 'ok',
    });
  });
});
