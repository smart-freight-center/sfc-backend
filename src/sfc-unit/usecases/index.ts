import { ParticipantGateway } from 'sfc-unit/dataGateways';
import { RetrieveCompaniesConnection } from './retrieve-companies';

export const retrieveCompaniesConnectionUsecase =
  new RetrieveCompaniesConnection(ParticipantGateway);
