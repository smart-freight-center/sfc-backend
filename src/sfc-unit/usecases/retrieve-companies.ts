import { ParticipantGatewayType } from '../types';

export class RetrieveCompaniesConnection {
  constructor(private partnerGateway: ParticipantGatewayType) {}

  async execute(participantId: string) {
    if (!participantId) return [];
    return this.partnerGateway.fetchParticipantConnections(
      participantId.toLowerCase()
    );
  }
}
