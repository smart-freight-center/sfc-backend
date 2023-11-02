import * as builder from 'utils/edc-builder';
import { COMPLETED_NEGOTIATION_STATES } from 'entities';
import { TransferInitiationFailed } from 'utils/errors';
import { sleep } from 'utils/helpers';
import { AppLogger } from 'utils/logger';
import { Participant } from 'core/types';
import { IEdcClient } from './interfaces';
import { Offer } from '@think-it-labs/edc-connector-client';
import { SingleAssetDetail } from 'core/usecases/interfaces';

const logger = new AppLogger('EdcTransferService');

export class EdcTransferService {
  constructor(private edcClient: IEdcClient) {}

  public getEdcClient() {
    return this.edcClient;
  }

  public async initiateTransferProcess(singleAsset: SingleAssetDetail) {
    const { contractOffer, assetId, provider } = singleAsset;

    logger.info('Initiating transfer...', { contractOffer });

    let contractAgreementId = await this.getContractAgreementId(assetId);

    if (contractAgreementId) {
      return this.initiateTransfer(provider, assetId, contractAgreementId);
    }

    await this.negotiateContractAndWaitToComplete(provider, contractOffer);

    contractAgreementId = await this.getContractAgreementId(assetId);

    return await this.initiateTransfer(
      provider,
      assetId,
      contractAgreementId as string
    );
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
  }

  private async waitForContractNegotiationToComplete(negotiationId: string) {
    logger.info(
      `Waiting for contract negotiation to complete for ${negotiationId}...`,
      { negotiationId }
    );

    let negotiationState = await this.edcClient.getNegotiationState(
      negotiationId
    );

    let negotiationIsPending =
      !COMPLETED_NEGOTIATION_STATES.has(negotiationState);

    while (negotiationIsPending) {
      logger.info('Negotation still pending. Waiting for another 1s...');
      await sleep(1000);

      negotiationState = await this.edcClient.getNegotiationState(
        negotiationId
      );

      negotiationIsPending =
        !COMPLETED_NEGOTIATION_STATES.has(negotiationState);
    }

    logger.info('CURRENT negotiation state ...', {
      state: negotiationState,
    });
    if (negotiationState !== 'FINALIZED') {
      logger.warn('The negotiation state is unknown...', {
        state: negotiationState,
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
    const agreements = await this.edcClient.queryAllAgreements({
      filterExpression: [
        {
          operandLeft: 'assetId',
          operator: '=',
          operandRight: assetId,
        },
      ],
    });

    if (!agreements.length) return;

    return agreements[0].id;
  }
}
