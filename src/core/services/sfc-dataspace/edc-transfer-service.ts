import * as builder from 'utils/edc-builder';
import { ContractNegotiationState } from 'entities';
import { TransferInitiationFailed } from 'utils/errors';
import { sleep } from 'utils/helpers';
import { AppLogger } from 'utils/logger';
import { Participant } from 'core/types';
import { IEdcClient } from './interfaces';
import { Offer } from '@think-it-labs/edc-connector-client';

const logger = new AppLogger('EdcTransferService');

export class EdcTransferService {
  constructor(private edcClient: IEdcClient) {}

  public getEdcClient() {
    return this.edcClient;
  }

  public async initiateTransferProcess(provider, contractOffer: Offer) {
    logger.info('Initiating transfer...');
    const assetId = contractOffer.asset?.id as string;
    const contractAgreementId = await this.getContractAgreementId(assetId);

    if (contractAgreementId) {
      const response = await this.initiateTransfer(
        provider,
        assetId,
        contractAgreementId
      );
      return response;
    }

    const contractAgreement = await this.negotiateContractAndWaitToComplete(
      provider,
      contractOffer
    );

    return await this.initiateTransfer(provider, assetId, contractAgreement.id);
  }

  private async negotiateContractAndWaitToComplete(
    provider,
    contractOffer: Offer
  ) {
    const negotiationResponse = await this.startContractNegotiation(
      provider,
      contractOffer
    );

    await this.waitForContractNegotiationToComplete(negotiationResponse.id);

    const agreementForNegotiation =
      await this.edcClient.getAgreementForNegotiation(negotiationResponse.id);
    return agreementForNegotiation;
  }

  private async waitForContractNegotiationToComplete(negotiationId: string) {
    logger.info(
      `Waiting for contract negotiation to complete for ${negotiationId}...`,
      { negotiationId }
    );

    let negotiation = await this.edcClient.getNegotiationState(negotiationId);

    while (
      negotiation.state === ContractNegotiationState.INITIAL ||
      negotiation.state === ContractNegotiationState.REQUESTING ||
      negotiation.state === ContractNegotiationState.PROVISIONING ||
      negotiation.state === ContractNegotiationState.REQUESTED
    ) {
      logger.info('Negotation still pending. Waiting for another 1s...');
      await sleep(1000);

      negotiation = await this.edcClient.getNegotiationState(negotiationId);
    }
    if (negotiation.state !== ContractNegotiationState.CONFIRMED) {
      logger.warn('The negotiation state is unknown...', {
        state: negotiation.state,
      });
      throw new TransferInitiationFailed();
    }
  }

  private async startContractNegotiation(
    provider: Omit<Participant, 'connection'>,
    contractOffer: Offer
  ) {
    logger.info('Starting contract negotiation...');

    const result = await this.negotiateContract(contractOffer, provider);

    logger.info('Contract negotation successful');

    return result;
  }

  private async negotiateContract(
    contractOffer: Offer,
    provider: Omit<Participant, 'connection'>
  ) {
    const contractNegotitionInput = builder.contractNegotiationInput(
      contractOffer,
      provider.connector_data
    );
    const contractNegotiationCreationResult =
      await this.edcClient.starContracttNegotiation(contractNegotitionInput);
    return contractNegotiationCreationResult;
  }

  private async initiateTransfer(
    provider: Omit<Participant, 'connection'>,
    assetId: string,
    contractAgreementId: string
  ) {
    const transferProcessInput = builder.transferProcessInput(
      assetId,
      provider.connector_data,
      contractAgreementId
    );
    const response = await this.edcClient.initiateTransfer(
      transferProcessInput
    );
    return response;
  }

  private async getContractAgreementId(assetId: string) {
    logger.info('Getting contractAgreement for asset...', { assetId });
    const agreementsFilter = builder.shipmentFilter('assetId', assetId, '=');
    const agreements = await this.edcClient.queryAllAgreements(
      agreementsFilter
    );

    if (!agreements.length) return;

    return agreements[0].id;
  }
}
