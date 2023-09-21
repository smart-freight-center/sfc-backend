import { server } from 'api';
import chai from 'chai';

describe('Health Test', () => {
  it('should return status of ok', async () => {
    const res = await chai.request(server).get('/health');
    res.status.should.be.eql(200);
    res.body.should.be.eql({
      status: 'ok',
    });
  });
});
