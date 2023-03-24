import { ParticipantGateway } from 'core/dataGateways/participant-gateway';

describe('Participant Gateways', () => {
  it('should create a Participant', async () => {
    const amazon = await ParticipantGateway.createParticipant({
      companyName: 'Amazon',
      email: 'example@amazon.com',
      role: 'SHIPPER',
    });

    const amazonLSP1 = await ParticipantGateway.createParticipant({
      companyName: 'Amazon Carrier 1',
      email: 'example1@amazon.com',
      role: 'LSP',
    });

    const amazonLSP2 = await ParticipantGateway.createParticipant({
      companyName: 'Amazon Carrier 2',
      email: 'example2@amazon.com',
      role: 'LSP',
    });

    await ParticipantGateway.createParticipant({
      companyName: 'Some other Carrier',
      email: 'example3@amazon.com',
      role: 'LSP',
    });

    await ParticipantGateway.createConnection(amazon.id, amazonLSP1.id);
    await ParticipantGateway.createConnection(amazon.id, amazonLSP2.id);

    const connections = await ParticipantGateway.fetchParticipantConnections(
      amazon.id
    );

    connections.length.should.be.eql(2);
  });
});
