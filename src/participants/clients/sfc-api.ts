import axios from 'axios';
import { ParticipantType } from 'entities/client-types';
import { ParticipantNotFound } from 'utils/error';
import { SFCAPI_BASEURL } from 'utils/settings';

const sfcAxios = axios.create({
  baseURL: SFCAPI_BASEURL,
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

      return response.data as Omit<ParticipantType, 'connection'>[];
    } catch (error) {
      console.log('The error occured here...');

      console.log(error);

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
