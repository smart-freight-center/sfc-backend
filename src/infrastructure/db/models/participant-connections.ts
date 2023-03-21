import { Table, Column, ForeignKey, DataType } from 'sequelize-typescript';
import { BaseModel } from './base-model';
import { Participant } from './participants';

type ParticipantType = {
  participantId1: string;
  participantId2: string;
};

@Table({
  tableName: 'participant_connection',
})
export class ParticipantConnection extends BaseModel<ParticipantType> {
  @ForeignKey(() => Participant)
  @Column({
    allowNull: false,
    field: 'participant_id_1',
    type: DataType.STRING,
  })
  participantId1: string;

  @ForeignKey(() => Participant)
  @Column({
    allowNull: false,
    field: 'participant_id_2',
    type: DataType.STRING,
  })
  participantId2: string;
}
