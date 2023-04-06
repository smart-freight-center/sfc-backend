import { EdcAdapter } from 'participants/clients/edc-client';
import { SFCAPIType } from 'participants/types';
import { ContractNotFound } from 'utils/error';
import { validateSchema } from 'utils/helpers';
import * as builder from '../utils/edc-builder';
import { ParticipantType } from 'entities/client-types';

const initiateTransferSchema = {
  companyId: ['required', { minLength: 2 }],
  contractNegotiationId: ['required', { minLength: 2 }],
  shipmentId: ['required', { minLength: 2 }],
};

type Input = {
  companyId: string;
  contractNegotiationId: string;
  shipmentId: string;
};

export class InitiateFileTransferUsecase {
  constructor(private edcClient: EdcAdapter, private sfcAPI: SFCAPIType) {}

  async execute(inputData: Input, authorization: string) {
    validateSchema(inputData, initiateTransferSchema);

    const { contractNegotiationId, companyId, shipmentId } = inputData;

    const provider = await this.getProvider(authorization, companyId);

    const contractAgreementId = await this.getContractAgreementId(
      contractNegotiationId
    );

    const response = await this.initiateTransfer(
      provider,
      shipmentId,
      contractAgreementId
    );

    return response;
  }

  private async getProvider(authorization: string, companyId: string) {
    const sfcConnection = await this.sfcAPI.createConnection(
      authorization || ''
    );

    const provider = await sfcConnection.getCompany(companyId);
    return provider;
  }

  private async initiateTransfer(
    provider: Omit<ParticipantType, 'connection'>,
    shipmentId: string,
    contractAgreementId: string
  ) {
    const transferProcessInput = builder.transferProcessInput(
      shipmentId,
      provider.connector_data.id,
      provider.connector_data.addresses.protocol,
      contractAgreementId
    );
    const response = await this.edcClient.initiateTransfer(
      transferProcessInput
    );
    return response;
  }

  private async getContractAgreementId(contractId: string) {
    const response = await this.edcClient.getContractNegotiationResponse(
      contractId
    );

    if (!response.contractAgreementId) throw new ContractNotFound();

    return response.contractAgreementId;
  }
}
