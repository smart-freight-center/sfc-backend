import fs from 'fs';
import path from 'path';
import { ParticipantNotFound } from 'core/error';

type ParticipantType = {
  company_name: string;
  client_id: string;
  role: 'shipper' | 'lsp';
  connection: string[];
  public_key: string;
};

export class ParticipantGateway {
  private static _participants: Record<string, ParticipantType>;

  private static getParticipants() {
    if (ParticipantGateway._participants) return this._participants;
    const appRoot = process.cwd();

    const url = path.join(appRoot, 'participants.json');
    const { participants } = JSON.parse(fs.readFileSync(url, 'utf-8'));

    const participantsMapper: Record<string, ParticipantType> = {};

    for (const participant of participants) {
      participantsMapper[participant.client_id] = participant;
    }

    ParticipantGateway._participants = participantsMapper;

    return participantsMapper;
  }

  static async fetchParticipantConnections(participantId: string) {
    const participants = await ParticipantGateway.getParticipants();
    const participant = participants[participantId];
    if (!participant) throw new ParticipantNotFound();

    const connections = participant.connection.map((partnerClientId) => {
      const participant = participants[partnerClientId];

      return {
        client_id: participant.client_id,
        company_name: participant.company_name,
      };
    });

    return connections;
  }

  static async getParticipant(clientId: string) {
    const participants = await ParticipantGateway.getParticipants();
    const participant = participants[clientId];

    if (!participant) throw new ParticipantNotFound();
    return participant;
  }
}
