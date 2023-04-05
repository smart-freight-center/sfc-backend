import { ParticipantGatewayType } from 'core/types';

export class RetrieveCompaniesConnection {
  constructor(private partnerGateway: ParticipantGatewayType) {}

  async listCompanies(participantId: string) {
    if (!participantId) return [];
    return this.partnerGateway.fetchParticipantConnections(
      participantId.toLowerCase()
    );
  }

  async getCompany(clientId: string) {
    if (!clientId) return;
    return this.partnerGateway.getParticipant(clientId);
  }
}
