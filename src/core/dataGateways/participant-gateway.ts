import { v4 } from 'uuid';
import { Op } from 'sequelize';
import { ParticipantConnection } from '../../infrastructure/db/models/participant-connections';
import {
  Participant,
  ParticipantEntity,
} from '../../infrastructure/db/models/participants';

export class ParticipantGateway {
  static async createParticipant(data: ParticipantEntity) {
    return Participant.create({ ...data, email: data.email.toLowerCase() });
  }

  static async createParticipants(data: ParticipantEntity[]) {
    const newParticipants = data.map((item) => ({
      ...item,
      id: item.id || v4(),
      email: item.email.toLowerCase(),
    }));
    await Participant.bulkCreate(newParticipants);

    return newParticipants;
  }
  static async createConnection(
    participantId1: string,
    participantId2: string
  ) {
    return ParticipantConnection.create({
      participantId1,
      participantId2,
    });
  }

  static async fetchParticipantConnections(participantId: string) {
    const participantConnections = await ParticipantConnection.findAll({
      where: {
        [Op.or]: [
          { participantId1: participantId },
          { participantId2: participantId },
        ],
      },
    });

    const userConnectionIds = new Set<string>();

    for (const participantConnection of participantConnections) {
      userConnectionIds.add(participantConnection.participantId1);
      userConnectionIds.add(participantConnection.participantId2);
    }

    userConnectionIds.delete(participantId);

    return Participant.findAll({ where: { id: [...userConnectionIds] } });
  }
}
