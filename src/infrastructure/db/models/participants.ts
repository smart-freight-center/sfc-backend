import { Table, Column, DataType } from 'sequelize-typescript';
import { BaseModel } from './base-model';

export type ParticipantEntity = {
  id?: string;
  email: string;
  companyName: string;
  role: 'LSP' | 'SHIPPER' | 'SUBCARRIER';
};

@Table({
  tableName: 'participants',
})
export class Participant extends BaseModel<ParticipantEntity> {
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  email: string;

  @Column({
    allowNull: false,
    field: 'company_name',
    type: DataType.STRING,
  })
  companyName: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  role: string;
}
