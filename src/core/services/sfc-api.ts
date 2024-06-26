import axios, { AxiosError } from 'axios';
import { Participant } from 'core/types';
import { ISFCAPIConnection, ISFCAPI } from 'core/usecases/interfaces';
import {
  InvalidSFCAPIConnectionError,
  InvalidToken,
  InvalidTokenInSFCAPI,
  ParticipantNotFound,
} from 'utils/errors';
import { SFC_UNIT_BASEURL } from 'utils/settings';

const sfcAxios = axios.create({
  baseURL: `${SFC_UNIT_BASEURL}/api`,
});

class SfcAPI implements ISFCAPI {
  createConnection(authorization: string) {
    return new SFCAPI(authorization);
  }
}

export class SFCAPI implements ISFCAPIConnection {
  constructor(private authorization = '') {}

  static async createConnection(authorization: string) {
    return new SFCAPI(authorization);
  }
  async getCompanies() {
    try {
      const response = await sfcAxios.get('/companies', {
        headers: { Authorization: this.authorization },
      });

      return response.data as Omit<Participant, 'connection'>[];
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        throw new InvalidTokenInSFCAPI();
      }

      throw new InvalidSFCAPIConnectionError();
    }
  }

  async getMyProfile() {
    try {
      const response = await sfcAxios.get('/companies/me', {
        headers: { Authorization: this.authorization },
      });

      return response.data as Participant;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        throw new InvalidTokenInSFCAPI();
      }

      throw new InvalidToken();
    }
  }

  async getCompany(clientId: string) {
    const companies = await this.getCompanies();

    const company = companies.find((company) => company.client_id == clientId);

    if (!company) {
      throw new ParticipantNotFound();
    }
    return company;
  }
}

export const sfcAPI = new SfcAPI();
