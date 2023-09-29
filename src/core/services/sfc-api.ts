import axios, { AxiosError } from 'axios';
import { Participant } from 'core/types';
import { InvalidTokenInSFCAPI, ParticipantNotFound } from 'utils/errors';
import { SFCAPI_BASEURL } from 'utils/settings';

const sfcAxios = axios.create({
  baseURL: `${SFCAPI_BASEURL}/api`,
});

export class SFCAPI {
  private constructor(private authorization = '') {}

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

      throw error;
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

      throw error;
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
