import fs from 'fs';
import path from 'path';
import { ParticipantType } from 'entities/client-types';
import { ParticipantNotFound } from 'utils/error';
import {
  PARTICIPANT_CONFIG_S3_BUCKET,
  PARTICIPANT_CONFIG_KEY,
  AWS_REGION,
} from 'utils/settings';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@aws-sdk/util-stream-node';
import { AppLogger } from 'utils/logger';

const logger = AppLogger.createLogger('ParticipantGateway');
export class ParticipantGateway {
  private static _participants: Record<string, ParticipantType>;
  private static PARTICIPANTS_FILE = 'participants.json';

  private static async getParticipants() {
    if (ParticipantGateway._participants) return this._participants;

    const participants = await ParticipantGateway.fetchParticipantsData();

    const participantsMapper: Record<string, ParticipantType> = {};

    for (const participant of participants) {
      participantsMapper[participant.client_id] = participant;
    }

    ParticipantGateway._participants = participantsMapper;

    return participantsMapper;
  }
  private static async fetchParticipantsData(): Promise<ParticipantType[]> {
    if (PARTICIPANT_CONFIG_S3_BUCKET && PARTICIPANT_CONFIG_KEY) {
      logger.info('Reading particiopants configuration file from S3');
      return ParticipantGateway.fetchConfigFromS3(
        PARTICIPANT_CONFIG_S3_BUCKET,
        PARTICIPANT_CONFIG_KEY
      );
    }
    logger.warn(
      'S3 participants configuration file location not defined, falling back to reading from local file'
    );
    return ParticipantGateway.readParticipantConfigFile();
  }

  private static async fetchConfigFromS3(
    s3Bucket: string,
    configFileKey: string
  ): Promise<ParticipantType[]> {
    const client = new S3Client({ region: AWS_REGION });

    const awsResponse = await client.send(
      new GetObjectCommand({
        Bucket: s3Bucket,
        Key: configFileKey,
      })
    );
    const objectString = await sdkStreamMixin(
      awsResponse.Body
    ).transformToString();
    const data = JSON.parse(objectString) as {
      participants: ParticipantType[];
    };
    return data.participants;
  }

  private static readParticipantConfigFile() {
    logger.info('Reading pariticipants config from local file...');

    const appRoot = process.cwd();
    const url = path.join(appRoot, this.PARTICIPANTS_FILE);
    const { participants } = JSON.parse(fs.readFileSync(url, 'utf-8'));

    logger.info('Successfully read participants config from local file.');

    return participants;
  }

  static async fetchParticipantConnections(participantId: string) {
    console.log("Getting participant with participant ID ", participantId)
    const participants = await ParticipantGateway.getParticipants();
    const participant = participants[participantId];
    if (!participant) throw new ParticipantNotFound();

    const connections = participant.connection.map((partnerClientId) => {
      const participant = participants[partnerClientId];

      return {
        client_id: participant.client_id,
        company_BNP: participant.company_BNP,
        company_name: participant.company_name,
        connector_data: participant.connector_data,
        role: participant.role,
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
